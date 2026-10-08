import sys

try:
    import win32com.client
    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False
    doc = word.Documents.Open(r"E:\KLH\2nd year\ML\project\new srinath 106 THINK-AI.docx")
    pages = doc.ComputeStatistics(2) # 2 = wdStatisticPages
    words = doc.ComputeStatistics(0) # 0 = wdStatisticWords
    print(f"Word pages: {pages}, words: {words}")
    doc.Close(False)
    word.Quit()
except Exception as e:
    print(f"Error checking page count with COM: {e}")
