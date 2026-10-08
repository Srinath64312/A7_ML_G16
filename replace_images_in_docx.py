import docx
import os
import shutil

PLOT_MAPPING = {
    "media/image1.png": "data/output_plots/ml_workflow_diagram.png",
    "media/image2.png": "data/output_plots/proposed_architecture_diagram.png",
    "media/image3.png": "data/output_plots/step02_eda_distributions.png",
    "media/image4.png": "data/output_plots/step04_irt_item_characteristic_curves.png",
    "media/image5.png": "data/output_plots/step05_bkt_mastery_trajectories.png",
    "media/image6.png": "data/output_plots/step06_dkt_loss_and_roc.png",
    "media/image7.png": "data/output_plots/step08_rl_convergence_and_qtable.png",
    "media/image8.png": "data/output_plots/step09_policy_benchmarks.png",
    "media/image9.png": "data/output_plots/step10_live_session_trajectory.png",
}

def replace_images_in_file(docx_path, out_path=None):
    if out_path is None:
        out_path = docx_path
    print(f"Updating embedded images in {docx_path} -> {out_path}...")
    doc = docx.Document(docx_path)
    
    # Iterate through all parts in document package
    replaced_count = 0
    for rel in doc.part.rels.values():
        if 'image' in rel.target_ref:
            target_name = rel.target_ref # e.g. 'media/image4.png' or 'image4.png'
            # normalize target_name
            norm_name = "media/" + os.path.basename(target_name)
            if norm_name in PLOT_MAPPING:
                src_plot = PLOT_MAPPING[norm_name]
                if os.path.exists(src_plot):
                    with open(src_plot, "rb") as fp:
                        new_bytes = fp.read()
                    # Replace image binary blob in docx part
                    rel.target_part._blob = new_bytes
                    print(f"  [OK] Replaced {norm_name} with {src_plot} ({len(new_bytes):,} bytes)")
                    replaced_count += 1
                else:
                    print(f"  [WARN] Source plot not found: {src_plot}")
                    
    doc.save(out_path)
    print(f"Successfully saved {out_path} with {replaced_count} updated images!\n")

if __name__ == '__main__':
    for f in ['new srinath 106 THINK-AI.docx', '106 Section 7_updated.docx']:
        if os.path.exists(f):
            replace_images_in_file(f)
    try:
        replace_images_in_file('106 Section 7.docx')
    except Exception as e:
        print(f"Note: 106 Section 7.docx was locked: {e}")
