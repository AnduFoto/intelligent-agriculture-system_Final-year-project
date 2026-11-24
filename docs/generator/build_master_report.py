import os
from step1_prelims import build_full_55page_report
from step2_ch1 import add_chapter_one
from step3_ch2 import add_chapter_two
from step4_ch3 import add_chapter_three
from step5_ch4 import add_chapter_four
from step6_ch5 import add_chapter_five
from step7_ch6 import add_chapter_six_and_end

def generate_master_dbu_report():
    print("Initializing Master DBU Project Report Builder...")
    
    # 1. Preliminaries
    doc = build_full_55page_report()
    
    # 2. Chapter One
    doc = add_chapter_one(doc)
    
    # 3. Chapter Two
    doc = add_chapter_two(doc)
    
    # 4. Chapter Three
    doc = add_chapter_three(doc)
    
    # 5. Chapter Four
    doc = add_chapter_four(doc)
    
    # 6. Chapter Five
    doc = add_chapter_five(doc)
    
    # 7. Chapter Six, References, Appendices
    doc = add_chapter_six_and_end(doc)
    
    output_docx = os.path.abspath("docs/final_report/DBU_IS_Final_Year_Project_Report_Massaye.docx")
    doc.save(output_docx)
    print(f"\nSUCCESS: Master 55-60 Page DBU Word Report Generated at:\n{output_docx}")

if __name__ == "__main__":
    generate_master_dbu_report()
