# Hướng Dẫn Quản Lý Dữ Liệu Qua Google Sheets

Chúc mừng bạn! Trang web của bạn nay đã được liên kết với **Google Sheets**. Nghĩa là bạn chỉ cần mở file Excel online trên điện thoại hoặc máy tính, dán link vào là web sẽ tự động cập nhật ngay lập tức. Không bao giờ cần phải đụng vào code nữa!

Dưới đây là các bước để bạn tự tạo 1 file quản lý cho riêng mình:

## Bước 1: Tạo Google Sheets
1. Đăng nhập vào Google Drive của bạn.
2. Tạo một bảng tính (Google Sheets) mới.
3. Ở Dòng số 1 (Dòng tiêu đề), bạn gõ tên 8 cột lần lượt từ **Cột A đến Cột H** như sau (để cho dễ nhìn, code không bắt buộc đọc tên cột):
   - Cột A: **ID Video** (Ví dụ: vid-01, vid-02)
   - Cột B: **Tên Video** 
   - Cột C: **Mã nhúng FB (iframe)** 
   - Cột D: **Tên Sản phẩm**
   - Cột E: **Nền tảng** (Gõ chữ `shopee` hoặc `tiktok`)
   - Cột F: **Giá tiền** (Ví dụ: 150.000đ)
   - Cột G: **Link ảnh sản phẩm**
   - Cột H: **Link Affiliate** (Link kiếm tiền của bạn)

## Bước 2: Nhập dữ liệu (Cách nhập 1 video có nhiều sản phẩm)
Giả sử bạn có 1 video FB review 2 sản phẩm (1 áo, 1 quần). Bạn sẽ nhập 2 dòng trên Google Sheet:
- **Dòng số 2:** Cột A gõ `vid-01`, Cột C dán mã `iframe` video vào. Cột D ghi "Áo polo", Cột H dán link bán Áo.
- **Dòng số 3:** Cột A **vẫn gõ lại** `vid-01` (để web hiểu quần này vẫn nằm chung video trên), Cột C dán lại mã `iframe` đó. Cột D ghi "Quần bò", Cột H dán link bán Quần.

*(Nếu video chỉ có 1 sản phẩm thì bạn chỉ việc điền 1 dòng).*

## Bước 3: Xuất bản Google Sheet thành link CSV
Đây là bước QUAN TRỌNG NHẤT để web đọc được dữ liệu:
1. Trên Google Sheets, nhấn menu **Tệp (File)** > **Chia sẻ (Share)** > **Xuất bản lên web (Publish to web)**.
2. Trong bảng hiện ra, ở dòng "Toàn bộ tài liệu" (Entire document), giữ nguyên.
3. Ở ô "Trang web" (Web page) bên cạnh, bấm vào và chọn **Giá trị được phân tách bằng dấu phẩy (.csv)**.
4. Bấm nút **Xuất bản (Publish)**.
5. Sao chép cái đường link dài ngoằng mà nó vừa tạo ra.

## Bước 4: Dán link vào trang web
1. Mở file `js/app.js` trong thư mục code.
2. Tìm đến dòng số 8 có dòng chữ `DÁN_LINK_CSV_CỦA_BẠN_VÀO_ĐÂY`.
3. Xóa dòng chữ đó đi và **dán link bạn vừa copy ở Bước 3 vào giữa hai dấu nháy đơn** (`' '`).
   - Ví dụ: `const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/...';`
4. Lưu file lại. Từ giờ trở đi, bạn không bao giờ phải sửa file này nữa. Mọi thứ chỉ cần làm trên Google Sheets.

## Bước 5: Up Web lên GitHub
Bây giờ bạn tải toàn bộ thư mục này (`index.html`, `js/`, `css/`) lên GitHub theo hướng dẫn chuẩn để lấy link web miễn phí là xong.
