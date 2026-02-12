# Poster Designer Pro - ລາຍລະອຽດຄວາມສາມາດຂອງລະບົບ

ລະບົບ Poster Designer Pro ແມ່ນແອັບພລິເຄຊັນອອກແບບກຣາຟິກບົນເວັບ (Web-based Vector Design Application) ທີ່ທັນສະໄໝ, ພັດທະນາໂດຍໃຊ້ **React**, **Vite**, ແລະ **Fabric.js**. ລະບົບຖືກອອກແບບມາໃຫ້ມີປະສິດທິພາບສູງ ແລະ ຮອງຮັບການເຮັດວຽກທີ່ຫຼາກຫຼາຍ ຕັ້ງແຕ່ການອອກແບບພື້ນຖານຈົນເຖິງລະດັບມືອາຊີບ.

## 1. ພາບລວມ ແລະ ພື້ນທີ່ເຮັດວຽກ (Canvas & Workspace)

-   **Infinite Canvas (ພື້ນທີ່ເຮັດວຽກບໍ່ມີຂອບເຂດ):** ຜູ້ໃຊ້ສາມາດເຮັດວຽກໃນພື້ນທີ່ກວ້າງຂວາງແບບບໍ່ມີຂອບເຂດ, ພ້ອມທັງສາມາດຊູມ (Zoom) ໄດ້ຕັ້ງແຕ່ 10% ເຖິງ 500% ແລະ ເລື່ອນເບິ່ງ (Pan) ໄດ້ຢ່າງອິດສະຫຼະ.
-   **Viewport Controls:** ມີເຄື່ອງມືຄວບຄຸມມຸມມອງ, ຟັງຊັນ "Fit to Screen" ເພື່ອປັບໃຫ້ພໍດີກັບໜ້າຈໍ, ແລະ ຮອງຮັບການໃຊ້ Spacebar ເພື່ອຈັບເລື່ອນ (Hand Tool).
-   **ການປັບພື້ນຫຼັງ (Background):** ສາມາດປ່ຽນສີພື້ນຫຼັງໄດ້ຕາມຕ້ອງການ, ຮອງຮັບທັງສີດຽວ (Solid Color) ແລະ ການໄລ່ສີ (Linear Gradients) ແບບລວງຕັ້ງ, ລວງນອນ, ແລະ ທາງຂວາງ.

## 2. ການຈັດການວັດຖຸ (Object Management)

### ຮູບຮ່າງ (Shapes)

-   **ຮູບຮ່າງພື້ນຖານ:** ສີ່ຫຼ່ຽມ, ວົງມົນ, ສາມຫຼ່ຽມ.
-   **ຮູບຮ່າງຂັ້ນສູງ:** ດາວ (Star), ຫ້າຫຼ່ຽມ (Pentagon), ຫົກຫຼ່ຽມ (Hexagon), ລູກສອນ (Arrow), ຫົວໃຈ (Heart), ແລະ ກ່ອງຂໍ້ຄວາມ (Message Box).
-   **ການປັບແຕ່ງ:** ສາມາດປັບຂະໜາດເສັ້ນຂອບ (Stroke), ສີ, ແລະ ເງົາ (Shadow) ໄດ້ຢ່າງລະອຽດ.

### ຂໍ້ຄວາມ (Text)

-   **ການຈັດການຂໍ້ຄວາມ:** ຮອງຮັບການພິມ ແລະ ແກ້ໄຂຂໍ້ຄວາມແບບ Rich Text.
-   **Font Support:** ຮອງຮັບ Google Fonts ແລະ **ຟອນລາວ (Lao Fonts)** ເຊັ່ນ: Phetsarath OT.
-   **ການຕົກແຕ່ງ:** ຕົວໜາ (Bold), ຕົວອຽງ (Italic), ຂີດກ້ອງ (Underline), ການຈັດວາງ (Alignment), ແລະ ໄລຍະຫ່າງ (Spacing).
-   **Text Effects (ເອັບເຟັກຂໍ້ຄວາມ):**
    -   **Neon Glow:** ແສງນີອອນ.
    -   **Drop Shadow:** ເງົາຕົກກະທົບ.
    -   **Outline:** ເສັ້ນຂອບ.
    -   **Hollow:** ຕົວໜັງສືໂປ່ງ.
    -   **Lift:** ເງົາແບບນຸ່ມນວນ.

### ຮູບພາບ (Images) ແລະ AI Features

-   **AI Background Removal:** ສາມາດລຶບພື້ນຫຼັງຮູບພາບໄດ້ທັນທີໂດຍໃຊ້ AI (@huggingface/transformers) ເຮັດວຽກຢູ່ຝັ່ງ Client ໂດຍບໍ່ຕ້ອງສົ່ງຂຶ້ນ Server.
-   **AI Upscaling:** ເພີ່ມຄວາມລະອຽດຂອງຮູບພາບໄດ້ 2 ເທົ່າ ດ້ວຍລະບົບ Super-Resolution.
-   **Image Filters:** ມີຟິວເຕີ (Filters) ໃຫ້ເລືອກກວ່າ 11 ແບບ ເຊັ່ນ: Brightness, Contrast, Blur, Grayscale, Sepia, ແລະອື່ນໆ.
-   **ການຕັດຮູບ (Cropping):** ເຄື່ອງມືຕັດຮູບພາບທີ່ໃຊ້ງານງ່າຍ ພ້ອມການສະແດງຜົນແບບ Real-time.
-   **Masking:** ສາມາດໃສ່ຮູບພາບເຂົ້າໄປໃນຮູບຮ່າງຕ່າງໆໄດ້ (ClipPath).
-   **Vectorization:** ປ່ຽນຮູບພາບ Raster ໃຫ້ເປັນ Vector (SVG) ໄດ້.
-   **Color Extraction:** ດຶງສີຫຼັກ (Dominant Color) ແລະ ສ້າງ Palette ສີຈາກຮູບພາບໄດ້.
-   **Text Extraction (OCR):** ດຶງຂໍ້ຄວາມຈາກຮູບພາບໄດ້ (ຮອງຮັບພາສາລາວ ແລະ ອັງກິດ).

### SVG Support

-   ນຳເຂົ້າໄຟລ໌ SVG ແລະ ແກ້ໄຂໄດ້ແບບແຍກຊິ້ນສ່ວນ (Editable Groups).

## 3. ເຄື່ອງມືຊ່ວຍເຫຼືອ ແລະ Workflow (Workflow Enhancements)

-   **Elements Library:** ຄັງຊັບພະຍາກອນຄົບວົງຈອນ ທີ່ມີການຈັດໝວດໝູ່ຢ່າງຊັດເຈນ.
-   **Stock Photos:** ຄົ້ນຫາ ແລະ ນຳເຂົ້າຮູບພາບຟຣີຈາກ Unsplash ໄດ້ໂດຍກົງ.
-   **Icon Library:** ເຊື່ອມຕໍ່ກັບ Iconify ເພື່ອຄົ້ນຫາ ແລະ ໃຊ້ງານໄອຄອນ (Vector Icons) ນັບພັນແບບ.
-   **Emoji Picker:** ຮອງຮັບການໃສ່ Emoji ເຂົ້າໃນການອອກແບບ.
-   **QR Code Generator:** ສ້າງ QR Code ແບບ Vector ທີ່ຄົມຊັດ (ຮອງຮັບຂໍ້ຄວາມ ແລະ URL).
-   **Barcode Generator:** ສ້າງບາໂຄດສິນຄ້າໄດ້ຫຼາຍມາດຕະຖານ (CODE128, EAN, UPC, ແລະອື່ນໆ).
-   **Chart Generator:** ສ້າງກຣາຟສະແດງຂໍ້ມູນ (Bar, Line, Pie, Doughnut) ໄດ້ງ່າຍດາຍ.

-   **Smart Guides & Snapping:**

    -   ມີເສັ້ນນຳທາງອັດສະລິຍະຊ່ວຍຈັດວາງວັດຖຸ.
    -   ລະບົບ Snapping ຊ່ວຍໃຫ້ວັດຖຸຕິດກັນ ຫຼື ເຄິ່ງກາງໄດ້ຢ່າງແມັ້ນຍຳ.
    -   Grid System: ຕາຕະລາງຊ່ວຍກຳນົດຕຳແໜ່ງ.

-   **Layers Panel:** ຈັດການຊັ້ນວັດຖຸ (Layers) ໄດ້ງ່າຍ (Lock, Hide, Reorder).
-   **Floating Toolbar:** ແຖບເຄື່ອງມືລອຍທີ່ຈະປະກົດຂຶ້ນເມື່ອເລືອກວັດຖຸ ເພື່ອຄວາມສະດວກໃນການແກ້ໄຂ.
-   **History System:** ລະບົບ Undo/Redo ທີ່ບັນທຶກທຸກການເຄື່ອນໄຫວ.
-   **Clipboard:** ຮອງຮັບການ Copy/Paste ວັດຖຸພາຍໃນ ແລະ ຈາກພາຍນອກ (ເຊັ່ນ: ຂໍ້ຄວາມ).

## 4. ການບັນທຶກ ແລະ ສົ່ງອອກ (Save & Export)

-   **High-Quality Export:**
    -   ສົ່ງອອກເປັນໄຟລ໌ຮູບພາບ **PNG** ແລະ **JPG**.
    -   ຮອງຮັບການປັບຄຸນນະພາບ (Scale Factor) ໄດ້ເຖິງ **4x (4 ເທົ່າ)** ເພື່ອຄວາມຄົມຊັດສູງສຳລັບການພິມ.
-   **PDF Export:** ສ້າງໄຟລ໌ PDF ຕາມຂະໜາດໜ້າວຽກທີ່ກຳນົດ.
-   **Project Save (JSON):**
    -   ບັນທຶກໂປຣເຈັກເປັນໄຟລ໌ `.json` ເພື່ອນຳກັບມາແກ້ໄຂພາຍຫຼັງໄດ້.
    -   ບັນທຶກສະຖານະທຸກຢ່າງຂອງວັດຖຸ (Layers, Effects, Text).
    -   ຮອງຮັບການຝັງຮູບຕົວຢ່າງ (Thumbnail) ໃນໄຟລ໌ໂປຣເຈັກ.

## 5. ເຕັກໂນໂລຊີທີ່ໃຊ້ (Technology Stack)

-   **Frontend Framework:** React 19, Vite 7.
-   **Canvas Engine:** Fabric.js 6.9.
-   **UI Components:** Lucide React, React-Colorful, SweetAlert2.
-   **AI & Processing:** @huggingface/transformers, TensorFlow.js, Tesseract.js, UpscalerJS.
