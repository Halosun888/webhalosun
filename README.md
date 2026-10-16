# HALOSUN – Khái toán điện mặt trời (bản web)

Trang web tĩnh, chạy được trên GitHub Pages. **Chỉ cần 1 file `index.html`** (React đã được nhúng sẵn bên trong).

## Đưa lên GitHub Pages
1. Tải lên repo (thư mục gốc): `index.html`, `favicon.png`, `apple-touch-icon.png`.
2. Settings → Pages → Branch `main` / root → Save.
3. Sau khi cập nhật, nhấn Ctrl+F5 để xóa bản cũ trong trình duyệt.

## Lưu báo giá vào Google Sheet (qua link /exec)
1. Tạo Google Sheet mới → Tiện ích mở rộng → Apps Script → dán toàn bộ `apps-script/Code.gs`.
2. Triển khai → Ứng dụng web: *Thực thi bằng: Tôi*, *Ai có quyền truy cập: Bất kỳ ai*.
3. Copy link kết thúc bằng `/exec`, mở trang web → nút **⚙ Cài đặt lưu báo giá** → dán link → Lưu.
4. Nhập tên và số điện thoại khách (10 số) rồi bấm **💾 Lưu báo giá**. Sheet có 2 tab: `BaoGia` (mỗi báo giá một dòng) và `ChiTiet` (bảng kê vật tư).
   Lưu lại cùng một mã báo giá sẽ cập nhật dòng cũ, không tạo dòng trùng.
- Muốn đặt mã bảo vệ: sửa `TOKEN` trong `Code.gs`, rồi nhập cùng mã ở ô "Mã bảo vệ" trên trang.
- Muốn cố định link cho mọi máy: điền vào `execUrl:''` ở dòng `const CFG=` trong `index.html`.
- Nút **⬇ Tải Excel** tạo file `.xlsx` (2 sheet: Báo giá, Vật tư) ngay trên máy, không cần Google Sheet.

## Sửa giá, hotline, logo
Mở `index.html`, tìm `const CFG=` và các bảng `PVTECH`, `INVT`, `BATT`, `TOU`, `FLAT`, `ROOF`, `P`.
Nhân công: để trống = "Thỏa thuận" (không tính vào tổng); nhập số tiền thì tính trọn gói.

## Sửa giao diện React (tùy chọn)
Mã nguồn ở `src/ui.jsx`. Sau khi sửa:
```
npm i react react-dom esbuild
npx esbuild src/ui.jsx --bundle --minify --format=iife --jsx=automatic --define:process.env.NODE_ENV='"production"' --outfile=react-ui.js
python build.py
```
`build.py` nhúng `react-ui.js` vào `index.html` (thẻ `<script id="react-bundle">`).
