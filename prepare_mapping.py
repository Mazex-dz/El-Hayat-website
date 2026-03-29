import os
import json
import re

# User's provided PDF list
user_pdf_list = """
(Thyroxine libre) ft4.pdf
(Thyroxine libre).pdf
17-Hydroxyprogesteron.pdf
AC ANTI CARDIOLIPINE IgG.pdf
Ac anti DNA natif.pdf
AC ANTI INSULINE 2.pdf
AC ANTI INSULINE.pdf
AC ANTI MITOCHONDRI.pdf
Ac anti- peau.pdf
AC ANTI-ACIDE GLUTAMIQUE DECARBOXYLASE.pdf
AC ANTI-ANTIGENES ENA.pdf
AC ANTI-CARDIOLIPINE IGM.pdf
AC ANTI-CARDIOLIPINE Screen (IgG, IgM).pdf
AC ANTI-RETICULINE.pdf
Ac anti-transglutaminase IgA.pdf
Ac anti-transglutaminase IgG.pdf
AC-ANTI ACETYLCHOLINE.pdf
ACIDE LACTIQUE.pdf
Aldolase.pdf
ALDOSTERONE URINAIRE.pdf
ALDOSTERONE.pdf
ALPHA 1 ANTI TRYPSINE.pdf
alpha-foetoproteine.pdf
Amylase.pdf
Anti corps anti beta.pdf
anti lupique circulant.pdf
Anti muscle lisse.pdf
ANTI-GAD.pdf
ANti-TPO.pdf
ANTICORPS ANTI -THYROGLOBILINE (anti TG).pdf
Anticorps anti-cytoplasme des polynucléaires neutro philes.pdf
Anticorps anti-endomysium IgA.pdf
Anticorps anti-muscles lisses.pdf
Anticorps anti-saccharomyces cervisiae (ASCA).pdf
antigéne carcino-embryonnaire.pdf
ANTISTREPTOLYSINE.pdf
ANTITHROMBINE 3.pdf
AUTO-ANTICORPS ANTI-IA2.pdf
b1bff4c8-93b7-4eef-b1d9-1189c9e87210.pdf
BETA HCG.pdf
c reactive.pdf
CERULEOPLASMINE.pdf
chain legere lambda.pdf
chaine legere urinaire.pdf
Chaines légéres Kappa.pdf
CHLAMYDIA IgG.pdf
CHLAMYDIA IgM.pdf
chlamydia oga.pdf
CHLAMYDIA.pdf
CHOLESTEROL HDL.pdf
CHOLESTEROL LDL.pdf
CHROMATOGRAPHI DES ACIDE AMINES.pdf
Cortisol - Copy.pdf
Cortisol.pdf
CPK.pdf
Créatine Phosphokinase.pdf
D-DIMERES.pdf
depakine.pdf
Déhydroépiandrostérone-sulfate.pdf
Déhydroépiandrostérone.pdf
ELECTROPHORESE DES PROTEINES.pdf
ELECTROPHORéSE DES PROTEINES URINAIRES.pdf
Enzyme de conversion de l'angiotensine.pdf
facteur de willebrand.pdf
facteur ix.pdf
facteur ruhmatdois.pdf
facteur vii.pdf
FER SERIQUE.pdf
FIBRINOGENE.pdf
FRUCTOSAMINE.pdf
Fsh.pdf
Ft3.pdf
GLUCOSE-6-PHOSPHATE DESHYDROGENASE (G6-PDH).pdf
GLUCOSE.pdf
HbA1C (Hb glyquée).pdf
HbA1C (Hb glyquée)HbA1C (Hb glyquée).pdf
HbA1C.pdf
HCG, MARQUEUR TUMORAL.pdf
HEMOSTASE (1).pdf
HEMOSTASE.pdf
HOMOCYSTEINE URINAIRE.pdf
HOMOCYSTEINEpdf.pdf
Hormone ANTI mullurienne.pdf
HORMONE ANTI-DIURETIQUE.pdf
Hormone de croissance (GH).pdf
Hormone de croissance GH.pdf
IgA anti-transglutaminase tissulaire.pdf
IGE LAIT DE VACHE.pdf
IGG 4.pdf
IgG anti-transglutaminase.pdf
Igg.pdf
insuline.pdf
LDH.pdf
LH.pdf
Lipase.pdf
LKM1.pdf
Locus B (Guide_immunogénétique_2018.)pdf.pdf
MAGNESIUM.pdf
magnisiuem.pdf
Mycloplasme sur sperm.pdf
names.txt
OESTRADIOL.pdf
peptide c.pdf
PHOSPHORE.pdf
phsphatase aclcaline.pdf
Phénylalanine.pdf
PROCALCITONINE.pdf
Progesterone.pdf
PROTEINE C ACTIVE.pdf
PSA LIBRE.pdf
PSA TOTALE.pdf
PTH.pdf
Somatomédine C IGF.pdf
sou IGC.pdf
testosterone libre.pdf
Testosterone.pdf
thrypoglobuline.pdf
THYROCALCITONINE.pdf
thyroxine t4.pdf
TRANSFERRINE.pdf
Tri-iodothyronine libre.pdf
triiodothyronine.pdf
troponine.pdf
Tshus.pdf
VITAMINE D2D3  25 HYDROXY VITAMINE D.pdf
ZINC.pdf
""".strip().split('\n')

# Actual files in nunupdf (extracted from Get-ChildItem and list_dir)
# I will use a list of common names to match
actual_files = [
    "17-hydroxyprogesterone.pdf", "AC ANTI INSULINE 2.pdf", "AC ANTI INSULINE.pdf", "AC ANTI MITOCHONDRI.pdf",
    "AC ANTI-ACIDE GLUTAMIQUE DECARBOXYLASE.pdf", "AC ANTI-ANTIGENES ENA.pdf", "AC ANTI-CARDIOLIPINE IGM.pdf",
    "AC ANTI-CARDIOLIPINE Screen (IgG, IgM).pdf", "AC ANTI-RETICULINE.pdf", "AC-ANTI ACETYLCHOLINE.pdf",
    "ALDOSTERONE URINAIRE.pdf", "ALDOSTERONE.pdf", "ANTI-GAD.pdf", "ANTICORPS ANTI -THYROGLOBILINE (anti TG).pdf",
    "ANTISTREPTOLYSINE.pdf", "ANTITHROMBINE 3.pdf", "AUTO-ANTICORPS ANTI-IA2.pdf", "Ac anti peau.pdf",
    "Ac anti-transglutaminase IgA.pdf", "Ac anti-transglutaminase IgG.pdf", "Aldolase.pdf", "Amylase.pdf",
    "Anti corps anti beta.pdf", "Anti muscle lisse.pdf", "Anticorps anti-cytoplasme des polynucléaires neutro philes.pdf",
    "Anticorps anti-endomysium IgA.pdf", "Anticorps anti-muscles lisses.pdf", "Anticorps anti-saccharomyces cervisiae (ASCA).pdf",
    "BETA HCG.pdf", "CERULEOPLASMINE.pdf", "CHLAMYDIA IgG.pdf", "CHLAMYDIA IgM.pdf", "CHLAMYDIA.pdf",
    "CHOLESTEROL HDL.pdf", "CHOLESTEROL LDL.pdf", "CHROMATOGRAPHI DES ACIDE AMINES.pdf", "CPK.pdf",
    "Chaines légéres Kappa.pdf", "Cortisol - Copy.pdf", "Cortisol.pdf", "Créatine Phosphokinase.pdf",
    "D-DIMERES.pdf", "Déhydroépiandrostérone-sulfate.pdf", "Déhydroépiandrostérone.pdf", "ELECTROPHORESE DES PROTEINES.pdf",
    "ELECTROPHORéSE DES PROTEINES URINAIRES.pdf", "Enzyme de conversion de l'angiotensine.pdf", "FER SERIQUE.pdf",
    "FIBRINOGENE.pdf", "FRUCTOSAMINE.pdf", "Fsh.pdf", "Ft3.pdf", "GLUCOSE-6-PHOSPHATE DESHYDROGENASE (G6-PDH).pdf",
    "GLUCOSE.pdf", "HCG, MARQUEUR TUMORAL.pdf", "HEMOSTASE (1).pdf", "HEMOSTASE.pdf", "HOMOCYSTEINE URINAIRE.pdf",
    "HOMOCYSTEINEpdf.pdf", "HORMONE ANTI-DIURETIQUE.pdf", "HbA1C (Hb glyquée).pdf", "HbA1C (Hb glyquée)HbA1C (Hb glyquée).pdf",
    "HbA1C.pdf", "Hormone ANTI mullurienne.pdf", "Hormone de croissance (GH).pdf", "Hormone de croissance GH.pdf",
    "IGE LAIT DE VACHE.pdf", "IGG 4.pdf", "IgA anti-transglutaminase tissulaire.pdf", "IgG anti-transglutaminase.pdf",
    "Igg.pdf", "insuline.pdf", "LDH.pdf", "LH.pdf", "Lipase.pdf", "LKM1.pdf", "Locus B (Guide_immunogénétique_2018.)pdf.pdf",
    "MAGNESIUM.pdf", "magnisiuem.pdf", "Mycloplasme sur sperm.pdf", "names.txt", "OESTRADIOL.pdf", "peptide c.pdf",
    "PHOSPHORE.pdf", "phsphatase aclcaline.pdf", "Phénylalanine.pdf", "PROCALCITONINE.pdf", "Progesterone.pdf",
    "PROTEINE C ACTIVE.pdf", "PSA LIBRE.pdf", "PSA TOTALE.pdf", "PTH.pdf", "Somatomédine C IGF.pdf", "sou IGC.pdf",
    "testosterone libre.pdf", "Testosterone.pdf", "thrypoglobuline.pdf", "THYROCALCITONINE.pdf", "thyroxine t4.pdf",
    "TRANSFERRINE.pdf", "Tri-iodothyronine libre.pdf", "triiodothyronine.pdf", "Troponine.pdf", "Tshus.pdf",
    "VITAMINE D2D3  25 HYDROXY VITAMINE D.pdf", "ZINC.pdf", "ac_anti_cardiolipine_igg.pdf", "acide_lactique.pdf",
    "alpha-foetoproteine.pdf", "alpha_1_anti_trypsine.pdf", "anti lupique circulant.pdf",
    "anti-tpoanticorps_anti-thyroperoxidase.pdf", "anticorps_anti_dna_natif.pdf", "antigéne carcino-embryonnaire.pdf",
    "b1bff4c8-93b7-4eef-b1d9-1189c9e87210.pdf", "c reactive.pdf", "chain legere lambda.pdf", "chaine legere urinaire.pdf",
    "chlamydia oga.pdf", "depakine.pdf", "facteur de willebrand.pdf", "facteur ix.pdf", "facteur ruhmatdois.pdf",
    "facteur vii.pdf", "ft4_thyroxine_libre.pdf", "ft4_thyroxine_libre2.pdf", "insuline.pdf", "magnisiuem.pdf",
    "peptide c.pdf", "phsphatase aclcaline.pdf", "sou IGC.pdf", "testosterone libre.pdf", "thrypoglobuline.pdf",
    "thyroxine t4.pdf", "triiodothyronine.pdf"
]

# We want to match actual_files to user_pdf_list to find renames
# Then we match user_pdf_list to analyses array in prices.html

# Simplified fuzzy matching for file renames
def simplify(name):
    return re.sub(r'[^a-zA-Z0-9]', '', name).lower()

matches = {}
for user_pdf in user_pdf_list:
    user_s = simplify(user_pdf)
    for actual in actual_files:
        actual_s = simplify(actual)
        if user_s == actual_s or user_s in actual_s or actual_s in user_s:
            if actual not in matches:
                matches[actual] = user_pdf

# Print renaming commands for physical files
print("### PHYSICAL FILE RENAMES ###")
for old, new in matches.items():
    if old != new:
        print(f'Rename-Item -Path "{old}" -NewName "{new}" -Force')

# Now for prices.html analyses array
# I need to match the user_pdf_list names to the 'nom' field in analyses
# I'll just print a mapping of (Analysis Name) -> (New Analysis Name)

# For example:
# FT4 (Thyroxine libre) -> (Thyroxine libre) ft4

# I'll manually check some critical ones based on the user's request
# FT4 (Thyroxine libre ) -> (Thyroxine libre) ft4
# FT3 ( Tri-iodothyronine libre ) -> Tri-iodothyronine libre
# Cortisol -> Cortisol
# etc.
