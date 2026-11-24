from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from locations.models import Region, Zone, Woreda, SpecialWoreda, Kebele
from consultations.models import CropType
from community.models import Post, PostLike, Comment, PostReport, ReportStatusChoices

User = get_user_model()


class CommunityModuleTests(TestCase):
    def setUp(self):
        self.region = Region.objects.create(name="Oromia")
        self.zone = Zone.objects.create(name="Jimma", region=self.region)
        self.woreda = Woreda.objects.create(name="Agaro", zone=self.zone)
        self.kebele = Kebele.objects.create(name="Kebele 01", woreda=self.woreda)

        self.crop = CropType.objects.create(name="Maize")

        self.farmer = User.objects.create_user(
            email="farmer@test.com",
            phone_number="+251911111111",
            password="Password123!",
            first_name="Abebe",
            last_name="Kebede",
            role="FARMER",
            status="ACTIVE",
            is_active=True,
            region=self.region,
            zone=self.zone,
            woreda=self.woreda,
            kebele=self.kebele
        )

        self.other_farmer = User.objects.create_user(
            email="farmer2@test.com",
            phone_number="+251922222222",
            password="Password123!",
            first_name="Hana",
            last_name="Tadesse",
            role="FARMER",
            status="ACTIVE",
            is_active=True,
            region=self.region,
            zone=self.zone,
            woreda=self.woreda,
            kebele=self.kebele
        )

        self.admin = User.objects.create_user(
            email="admin@test.com",
            phone_number="+251933333333",
            password="Password123!",
            first_name="System",
            last_name="Admin",
            role="ADMINISTRATOR",
            status="ACTIVE",
            is_active=True,
            region=self.region,
            zone=self.zone,
            woreda=self.woreda,
            kebele=self.kebele
        )

        self.client = APIClient()

    def test_post_creation_and_feed(self):
        self.client.force_authenticate(user=self.farmer)
        response = self.client.post('/api/community/posts/', {
            'content': 'Successfully controlled maize disease using organic treatment.',
            'crop_type': self.crop.id
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], 'Successfully controlled maize disease using organic treatment.')
        self.assertEqual(response.data['crop_name'], 'Maize')

        # List feed
        response = self.client.get('/api/community/posts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_post_edit_and_authorization(self):
        self.client.force_authenticate(user=self.farmer)
        create_res = self.client.post('/api/community/posts/', {'content': 'Original post content'})
        post_id = create_res.data['id']

        # Other farmer trying to edit should be forbidden
        self.client.force_authenticate(user=self.other_farmer)
        edit_res = self.client.patch(f'/api/community/posts/{post_id}/', {'content': 'Hacked content'})
        self.assertEqual(edit_res.status_code, status.HTTP_403_FORBIDDEN)

        # Original author editing should succeed
        self.client.force_authenticate(user=self.farmer)
        edit_res = self.client.patch(f'/api/community/posts/{post_id}/', {'content': 'Updated post content'})
        self.assertEqual(edit_res.status_code, status.HTTP_200_OK)
        self.assertEqual(edit_res.data['content'], 'Updated post content')
        self.assertTrue(edit_res.data['is_edited'])

    def test_post_like_toggle_and_duplicate_prevention(self):
        post = Post.objects.create(author=self.farmer, content="Like test post")
        self.client.force_authenticate(user=self.other_farmer)

        # Like post
        like_res = self.client.post(f'/api/community/posts/{post.id}/like/')
        self.assertEqual(like_res.status_code, status.HTTP_200_OK)
        self.assertTrue(like_res.data['liked'])
        self.assertEqual(like_res.data['likes_count'], 1)

        # Unlike post
        unlike_res = self.client.post(f'/api/community/posts/{post.id}/like/')
        self.assertEqual(unlike_res.status_code, status.HTTP_200_OK)
        self.assertFalse(unlike_res.data['liked'])
        self.assertEqual(unlike_res.data['likes_count'], 0)

    def test_comments_and_nested_replies(self):
        post = Post.objects.create(author=self.farmer, content="Comment test post")
        self.client.force_authenticate(user=self.other_farmer)

        # Add top-level comment
        c_res = self.client.post(f'/api/community/posts/{post.id}/comments/', {'content': 'Great post!'})
        self.assertEqual(c_res.status_code, status.HTTP_201_CREATED)
        comment_id = c_res.data['id']

        # Reply to comment
        self.client.force_authenticate(user=self.farmer)
        reply_res = self.client.post(f'/api/community/posts/{post.id}/comments/', {
            'content': 'Thank you!',
            'parent_comment': comment_id
        })
        self.assertEqual(reply_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(reply_res.data['parent_comment'], comment_id)

    def test_post_reporting_and_admin_moderation(self):
        post = Post.objects.create(author=self.farmer, content="Inappropriate post")
        self.client.force_authenticate(user=self.other_farmer)

        # Submit report
        rep_res = self.client.post(f'/api/community/posts/{post.id}/report/', {
            'reason': 'INAPPROPRIATE',
            'description': 'Contains non-agricultural content.'
        })
        self.assertEqual(rep_res.status_code, status.HTTP_201_CREATED)
        report_id = rep_res.data['id']

        # Non-admin viewing reports should be forbidden
        self.client.force_authenticate(user=self.farmer)
        admin_get_res = self.client.get('/api/community/reports/')
        self.assertEqual(admin_get_res.status_code, status.HTTP_403_FORBIDDEN)

        # Admin resolving report by removing content
        self.client.force_authenticate(user=self.admin)
        admin_get_res = self.client.get('/api/community/reports/')
        self.assertEqual(admin_get_res.status_code, status.HTTP_200_OK)

        resolve_res = self.client.patch(f'/api/community/reports/{report_id}/', {
            'status': 'ACTION_TAKEN',
            'action_type': 'REMOVE',
            'admin_note': 'Removed due to policy violation.'
        })
        self.assertEqual(resolve_res.status_code, status.HTTP_200_OK)

        # Verify post is soft-deleted
        post.refresh_from_db()
        self.assertTrue(post.is_deleted)
