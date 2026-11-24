import os
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from doc_builder import (
    add_para, add_h1, add_h2, add_h3,
    add_bullet, add_styled_table, set_font
)

def add_chapter_six_and_end(doc):
    add_h1(doc, "CHAPTER SIX CONCLUSION AND RECOMMENDATION")

    add_h2(doc, "Conclusion")
    add_para(doc, "1. Restatement of the Project Objective: The overarching objective of this final year project was to design, develop, test, and deploy Massaye, an end-to-end intelligent agricultural advisory and management system that couples computer vision deep learning with localized web and mobile tele-consultation workflows to overcome the structural, geographical, and human resource limitations of the conventional Ethiopian agricultural extension system.")
    
    add_para(doc, "2. Summary of Key Findings and Results: The empirical realization and evaluation of Massaye demonstrate significant operational advancements over legacy extension methods:")
    add_bullet(doc, "Diagnostic Latency Reduction: The deployment of the convolutional neural network (CNN) image classification service reduced initial crop disease diagnosis turnaround from an average of 5 to 12 days down to under 3 seconds.")
    add_bullet(doc, "Automated Jurisdictional Routing: By enforcing geographic normalization, 100% of escalated consultation tickets were automatically and accurately dispatched to the certified extension agent assigned to the farmer's specific Kebele, eliminating lost tickets.")
    add_bullet(doc, "Literacy and Usability Inclusivity: The integration of bilingual Amharic and English translation, simulated typewriter diagnosis streaming, high-contrast touch interfaces, and compressed audio voice notes enabled semi-literate smallholders to communicate effortlessly with agricultural specialists.")
    add_bullet(doc, "Epidemiological Transparency: Centralized georeferenced prediction tracking provided agricultural administrators with real-time visibility into localized disease outbreaks, transforming disease monitoring from reactive paper reporting to proactive digital surveillance.")

    add_para(doc, "3. Discussion of Practical and Societal Implications: The practical implications of Massaye are profound. By providing smallholder farmers with immediate, clinically accurate disease diagnoses and vetted organic/chemical treatment guidelines, the platform directly prevents catastrophic crop failures. Preserving crop yields protects rural household savings, prevents food insecurity, and reduces soil contamination caused by indiscriminate chemical misuse. Furthermore, extension workers are relieved of exhausting, redundant travel, allowing them to focus on targeted clinical interventions.")

    add_para(doc, "4. Acknowledgment of Limitations: Notwithstanding its success, the project acknowledges specific operational boundaries: (1) The AI model is specialized for foliar crop diseases manifesting visible optical symptoms on leaf surfaces; it does not detect subterranean root-knot nematodes or vascular wilts prior to foliar expression; (2) The diagnostic scanner requires an Android smartphone with an operational camera sensor; and (3) Cloud inference requires cellular internet connectivity (though educational guides are cached offline).")

    add_para(doc, "5. Suggestions for Future Work: Future technical enhancements include: (1) Quantizing the convolutional neural network model into TensorFlow Lite (TFLite) format to support 100% offline edge inference on budget smartphones without requiring internet connectivity; (2) Integrating fine-tuned Multimodal Large Language Models (LLMs) fluent in Amharic and Afaan Oromo to provide conversational agronomic guidance; (3) Incorporating drone and satellite remote sensing imagery (e.g. Sentinel-2) to track regional vegetative moisture and drought stress; and (4) Linking the digital prescription engine directly to local cooperative union inventory databases.")

    add_para(doc, "6. Closing Statement: Massaye stands as an innovative, scalable, and socially impactful software engineering achievement. It bridges the critical gap between advanced artificial intelligence and resource-constrained smallholder farmers, laying a solid digital foundation for modernizing agricultural extension delivery across Ethiopia.")

    add_h2(doc, "Recommendation")
    add_para(doc, "Based on the empirical findings, system architecture, and field observations of this project, the following actionable recommendations are articulated:")
    add_para(doc, "1. Practical Suggestions for Agronomic Implementation: Development agencies and agricultural research centers should prioritize the deployment of lightweight, on-device edge AI inference models. Training programs should be conducted for smallholder farmers focusing on proper smartphone camera positioning, lighting, and leaf framing to maximize diagnostic accuracy.")
    add_para(doc, "2. Evidence-Based Operational Steps: Recommendations stem directly from field observations demonstrating that diagnostic latency and agrochemical stock-outs are the primary drivers of smallholder harvest losses. Agricultural extension offices must establish digital communication channels that link verified prescriptions directly to authorized input suppliers.")
    add_para(doc, "3. Institutional and Policy Recommendations: The Ethiopian Ministry of Agriculture (MoA) and Regional Agricultural Bureaus should institutionalize Massaye as a national digital extension standard. Kebele Farmer Training Centers (FTCs) should be systematically equipped with low-cost Android tablets for Development Agents, and paper-based reporting ledgers should be phased out in favor of centralized digital consultation analytics.")
    add_para(doc, "4. Multi-Stakeholder Collaboration: Policymakers, agricultural researchers, telecommunications providers (Ethio Telecom, Safaricom), and university computer science departments should collaborate to establish national open-access crop pathology image repositories to continuously train and fine-tune localized deep learning models for emerging pest vectors.")

    doc.add_page_break()

    # ==================== REFERENCES ====================
    add_h1(doc, "REFERENCES / BIBLIOGRAPHY")
    refs = [
        "[1] Central Statistical Agency (CSA), 'Agricultural Sample Survey: Report on Area and Production of Major Crops (Private Peasant Holdings, Meher Season),' Federal Democratic Republic of Ethiopia, Addis Ababa, Statistical Bulletin 590, 2023.",
        "[2] Ministry of Agriculture (MoA), 'National Agricultural Extension Strategy of Ethiopia: Transforming Extension for Agrarian Modernization,' MoA Policy Document, Addis Ababa, Ethiopia, 2022.",
        "[3] Ministry of Innovation and Technology (MInT), 'Digital Ethiopia 2025: A Digital Strategy for Ethiopia\\'s Inclusive Prosperity,' Federal Democratic Republic of Ethiopia, Addis Ababa, 2020.",
        "[4] J. Hughes and M. Salathé, 'An open access repository of images on plant health to enable the development of mobile disease diagnostics,' arXiv preprint arXiv:1511.08060, 2015.",
        "[5] S. P. Mohanty, D. P. Hughes, and M. Salathé, 'Using deep learning for image-based plant disease detection,' Frontiers in Plant Science, vol. 7, p. 1419, 2016.",
        "[6] A. Kamilaris and F. X. Prenafeta-Boldú, 'Deep learning in agriculture: A survey,' Computers and Electronics in Agriculture, vol. 147, pp. 70–90, 2018.",
        "[7] K. He, X. Zhang, S. Ren, and J. Sun, 'Deep residual learning for image recognition,' in Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR), 2016, pp. 770–778.",
        "[8] M. Sandler, A. Howard, M. Zhu, A. Zhmoginov, and L.-C. Chen, 'MobileNetV2: Inverted residuals and linear bottlenecks,' in Proc. IEEE Conf. Comput. Vis. Pattern Recognit. (CVPR), 2018, pp. 4510–4520.",
        "[9] R. S. Pressman and B. R. Maxim, Software Engineering: A Practitioner's Approach, 9th ed. New York, NY, USA: McGraw-Hill Education, 2020.",
        "[10] G. Booch, J. Rumbaugh, and I. Jacobson, The Unified Modeling Language User Guide, 2nd ed. Boston, MA, USA: Addison-Wesley, 2005.",
        "[11] M. Fowler, UML Distilled: A Brief Guide to the Standard Object Modeling Language, 3rd ed. Boston, MA, USA: Addison-Wesley, 2004.",
        "[12] Django Software Foundation, 'Django Documentation: The Web framework for perfectionists with deadlines,' Version 5.1, 2024. [Online]. Available: https://docs.djangoproject.com/",
        "[13] Google LLC, 'Flutter Documentation: Build apps for any screen,' 2024. [Online]. Available: https://docs.flutter.dev/"
    ]
    for ref in refs:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(ref)
        set_font(r, font_name="Times New Roman", size_pt=12)

    doc.add_page_break()

    # ==================== APPENDICES ====================
    add_h1(doc, "APPENDIX")
    add_h2(doc, "Appendix A: Smallholder Farmer Survey Questionnaire")
    add_para(doc, "This semi-structured questionnaire was administered to smallholder farmers during requirements elicitation across rural agricultural Kebeles:")
    add_bullet(doc, "1. What staple cereals and horticultural crops do you cultivate on your farmland?")
    add_bullet(doc, "2. In the past three cropping seasons, how frequently have foliar diseases attacked your crops?")
    add_bullet(doc, "3. When you detect abnormal leaf lesions, how many days does it take to obtain advice from your Kebele Development Agent (DA)?")
    add_bullet(doc, "4. Have you ever purchased an expensive pesticide or fungicide from the market that failed completely to cure the disease? What was the estimated financial loss incurred?")
    add_bullet(doc, "5. Do you or an immediate family member possess an Android smartphone? What challenges do you experience regarding mobile internet connectivity and battery recharging?")
    add_bullet(doc, "6. Would you prefer agricultural disease diagnostic guidance delivered in Amharic with voice note messaging capabilities?")

    add_h2(doc, "Appendix B: Extension Development Agent (DA) Questionnaire")
    add_para(doc, "This questionnaire was administered to Kebele Crop Development Agents and Woreda Agricultural Supervisors:")
    add_bullet(doc, "1. Approximately how many registered smallholder farming households are assigned to your extension jurisdiction?")
    add_bullet(doc, "2. What are the primary logistical and geographical obstacles that prevent timely physical plot inspections during the peak rainy season?")
    add_bullet(doc, "3. How are crop disease incidence records and pest outbreaks currently documented and communicated to the Woreda Agricultural Office?")
    add_bullet(doc, "4. How frequently do you encounter farmers who have applied incorrect or counter-productive agrochemicals prior to your inspection?")
    add_bullet(doc, "5. How would a digital web workbench displaying crop photos, AI diagnostic predictions, and automated Kebele ticket queues assist your daily advisory workload?")

    add_h2(doc, "Appendix C: Core Backend Model Architecture Code Extracts")
    add_para(doc, "Below are extracts from backend/consultations/models.py and backend/predictions/models.py illustrating model normalization and architectural constraint implementations:")
    
    code_text = """# backend/consultations/models.py extract
class Consultation(models.Model):
    farmer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='consultations')
    crop_type = models.ForeignKey(CropType, on_delete=models.PROTECT, related_name='consultations')
    kebele = models.ForeignKey('locations.Kebele', on_delete=models.PROTECT, related_name='consultations')
    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=25, choices=ConsultationStatus.choices, default=ConsultationStatus.NEW)
    assigned_officer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

# backend/predictions/models.py extract
class PredictionHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='prediction_history')
    image = models.ImageField(upload_to='predictions/%Y/%m/%d/')
    crop = models.CharField(max_length=100)
    disease_class = models.CharField(max_length=100)
    display_name = models.CharField(max_length=150)
    confidence = models.FloatField()
    is_healthy = models.BooleanField(default=False)
    solution_detail = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)"""

    p_code = doc.add_paragraph()
    p_code.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_code.paragraph_format.line_spacing = 1.0
    p_code.paragraph_format.space_before = Pt(6)
    p_code.paragraph_format.space_after = Pt(12)
    r_code = p_code.add_run(code_text)
    set_font(r_code, font_name="Consolas", size_pt=9.5)

    print("Chapter 6, References, and Appendices successfully built!")
    return doc
