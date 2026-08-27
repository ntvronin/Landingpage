# `thi.html` — trang thi công khai cho ứng viên ngoài

## Nó là gì

`thi.html` là trang làm bài thi **đứng ngoài app myTPT**, phục vụ ứng
viên ngoài công ty (tuyển dụng) thi đánh giá năng lực — **không đăng
nhập**. Nó là 1 file HTML/CSS/JS thuần (không React, không build step,
không phụ thuộc `npm run build` của app chính), gọi trực tiếp 4 RPC
`guest_validate_code` / `guest_start_exam` / `guest_submit_exam` /
(gián tiếp) `guest_grade_exam` trên CÙNG một project Supabase đang chạy
myTPT. Xem logic phía DB ở `supabase/migrations/20260825141322_assessments_guest_schema.sql`
và `20260825141519_assessments_guest_rpc.sql`.

File này **không nằm trong pipeline build/deploy của app myTPT**
(Vite không đóng gói nó, không có route nào trong app trỏ tới nó).
Nó được trỏ tới từ một tên miền riêng — xem mục "Link ứng viên bấm vào"
bên dưới.

## Triển khai: copy thủ công sang web host riêng

`thi.html` phải được **copy tay** lên thư mục gốc của web host đang lưu
`index.html` công khai (hiện là `nguyenthanhvan.com.vn`), **cùng cấp**
với `index.html` và thư mục `css/` của trang đó — không phải một route
trong app React. Không có CI/CD nào tự copy file này; mỗi lần sửa
`thi.html` phải tự tay upload lại lên host.

Cấu trúc mong đợi trên host đích:

```
/ (web root)
├── index.html          ← trang chủ hiện có của host, KHÔNG đụng vào
├── thi.html             ← copy file này từ public-exam/thi.html
└── css/
    ├── variables.css
    ├── reset.css
    └── components.css
```

`thi.html` nạp 3 file CSS trên bằng `<link>` tương đối (`css/variables.css`…)
để dùng chung bộ màu/typography với trang chủ. Đây là tăng cường thẩm
mỹ, **không phải bắt buộc**: nếu 3 file đó thiếu hoặc tải lỗi, phần
`<style>` inline ngay trong `thi.html` đã tự đủ để trang chạy đúng và
đọc được — không trắng trang, không câm chức năng.

## Supabase anon key nằm thẳng trong file — là CỐ Ý

`thi.html` có `SUPABASE_URL` và `SUPABASE_KEY` (anon/publishable key)
hardcode ngay trong `<script>`. Đây không phải lỗi lộ secret: anon key
vốn **công khai theo thiết kế** của Supabase (nó đã nằm sẵn trong bundle
JS của app myTPT mà browser tải về, ai mở DevTools cũng đọc được). Thứ
bảo vệ dữ liệu là **RLS + các RPC `SECURITY DEFINER`** ở phía DB, không
phải việc giữ kín key này. Nếu đổi project Supabase (vd nhân bản app
cho đơn vị khác), phải tự tay sửa 2 hằng số này trong `thi.html` —
không có biến môi trường nào bơm vào file tĩnh này lúc runtime.

## Link ứng viên bấm vào: `VITE_GUEST_EXAM_URL`

Link/QR mà trang quản trị (`AdminExamCodes.tsx` → `ShareExamCodeDialog`)
sinh ra cho mỗi mã được dựng từ `GUEST_EXAM_URL` trong
`src/lib/assessments/guest.ts`:

```
GUEST_EXAM_URL = import.meta.env.VITE_GUEST_EXAM_URL || 'https://nguyenthanhvan.com.vn/thi.html'
```

Đặt biến môi trường `VITE_GUEST_EXAM_URL` (file `.env` của repo app
chính, **không phải** biến nào trong `thi.html`) để đổi tên miền mà
không phải sửa code — cần khi `thi.html` được host ở một nơi khác, hoặc
khi nhân bản app cho đơn vị khác dùng domain riêng. Đặt biến này xong
phải `npm run build` lại app (biến `VITE_*` được Vite nhúng vào lúc
build, không đọc lại lúc chạy).
