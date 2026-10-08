import win32com.client
import os

word = win32com.client.Dispatch("Word.Application")
word.Visible = False
try:
    doc = word.Documents.Open(os.path.abspath("thinkai.docx"))
    pages = doc.ComputeStatistics(2) # wdStatisticPages
    words = doc.ComputeStatistics(0) # wdStatisticWords
    print(f"thinkai.docx -> Pages: {pages}, Words: {words}")
    doc.Close(False)
finally:
    word.Quit()
