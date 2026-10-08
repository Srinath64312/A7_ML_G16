import os, glob

plots = glob.glob('data/output_plots/*.png')
print("Plots in data/output_plots:")
for p in plots:
    print(f"  {p}: {os.path.getsize(p)} bytes")
