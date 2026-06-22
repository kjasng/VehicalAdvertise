# Kịch Bản Thuyết Trình Bảo Vệ Đồ Án

**Đề tài: Hệ thống quản lý và kết nối quảng cáo trên phương tiện giao thông**

> ⚠️ **Lưu ý quan trọng về công nghệ:** Hệ thống thật dùng **Next.js (fullstack) + Supabase (PostgreSQL) + shadcn/ui + Supabase Auth (OAuth) + SePay** — KHÔNG dùng Node/Express/MySQL/AuthJS. Không nói nhầm trước hội đồng.
>
> Hệ thống có **4 actor**: Doanh nghiệp (Partner) – Chủ xe (Driver) – Gara (Garage) – Quản trị viên (Admin). Hai điểm ăn điểm: **vòng xác minh bằng ảnh** và **khóa ngân sách an toàn ở tầng database**.

---

## ⭐ MỞ ĐẦU (học gần như thuộc lòng — ~60–75 giây)

> Kính thưa hội đồng, em là **[Họ tên]**, đề tài tốt nghiệp của em là **"Hệ thống quản lý và kết nối quảng cáo trên phương tiện giao thông"**.
>
> Hiện nay nhu cầu quảng bá thương hiệu **ngoài trời** của doanh nghiệp ngày càng lớn, trong khi rất nhiều chủ xe cá nhân hằng ngày vẫn di chuyển trên đường nhưng **chưa khai thác được giá trị quảng cáo** từ chính chiếc xe của mình.
>
> Việc kết nối giữa hai bên hiện nay chủ yếu vẫn làm **thủ công** — liên hệ qua điện thoại, mạng xã hội — nên **khó tìm đúng đối tác**, **khó kiểm soát việc dán quảng cáo có thật hay không**, và đặc biệt **khó minh bạch dòng tiền** chi trả cho chủ xe.
>
> Xuất phát từ thực tế đó, đề tài của em xây dựng một **nền tảng trực tuyến kết nối bốn bên**: doanh nghiệp quảng cáo, chủ xe, gara dán decal và quản trị viên. Hệ thống cho phép doanh nghiệp **nạp ngân sách và tạo chiến dịch**, chủ xe **tham gia và nhận thu nhập hằng tháng**, gara **xác nhận việc dán quảng cáo bằng hình ảnh**, còn quản trị viên **điều phối và kiểm soát toàn bộ dòng tiền một cách minh bạch và an toàn**.

_(Sau câu này hội đồng đã nắm: Bối cảnh → Vấn đề → Giải pháp → 4 đối tượng.)_

---

## 1. GIỚI THIỆU BÀI TOÁN (Problem Statement)

**Nói:**

> Phương tiện cá nhân ở Việt Nam là một "mặt phẳng quảng cáo di động" rất lớn nhưng gần như chưa được khai thác. Chủ xe muốn có thêm thu nhập thụ động; doanh nghiệp muốn quảng cáo tới đúng khu vực, đúng tệp khách trên đường phố. Nhưng giữa hai nhu cầu đó **chưa có một nền tảng trung gian** đứng ra kết nối, xác minh và bảo đảm thanh toán.

**Slide ghi gọn:**

- Chủ xe: có xe, muốn thêm thu nhập → tài sản đang nhàn rỗi.
- Doanh nghiệp: cần kênh quảng cáo ngoài trời, linh hoạt, đo được.
- Khoảng trống: thiếu nền tảng kết nối + xác minh + thanh toán minh bạch.

---

## 2. HẠN CHẾ CỦA CÁCH LÀM HIỆN TẠI

_(Phần hội đồng hay "soi" — chuẩn bị kỹ)_

**Slide:**

- Tìm đối tác **thủ công**: qua người quen, điện thoại, mạng xã hội → chậm, hên xui.
- **Không xác minh được** quảng cáo có thực sự được dán và duy trì trên xe hay không → doanh nghiệp trả tiền mà không kiểm chứng.
- **Khó kiểm soát ngân sách & dòng tiền**: chia tiền cho chủ xe, cho gara dán decal đều làm tay → dễ sai, dễ tranh chấp.
- **Thiếu minh bạch hợp đồng**: trạng thái chiến dịch, ai đang chạy, đã chạy bao lâu… không ai theo dõi tập trung.

**Câu chốt (nếu hội đồng hỏi "tại sao phải làm hệ thống?"):**

> Vấn đề cốt lõi không nằm ở việc "tìm được người", mà ở **niềm tin và minh bạch**: làm sao doanh nghiệp chắc chắn quảng cáo được dán thật, và làm sao chủ xe chắc chắn được trả tiền đúng. Hệ thống của em giải quyết đúng hai điểm đó bằng **xác minh ảnh** và **kiểm soát dòng tiền ở tầng cơ sở dữ liệu**.

---

## 3. MỤC TIÊU CỦA ĐỀ TÀI

- Xây dựng nền tảng kết nối **chủ xe ↔ doanh nghiệp** qua trung gian vận hành (Admin).
- Quản lý **chiến dịch quảng cáo** tập trung từ lúc tạo đến lúc hoàn thành.
- **Xác minh việc dán quảng cáo** bằng ảnh minh chứng trước khi tính tiền.
- Bảo đảm **dòng tiền minh bạch, an toàn**: nạp tiền, giữ ngân sách, chi trả thu nhập, lập hóa đơn.

---

## 4. GIẢI PHÁP ĐỀ XUẤT ⭐ _(phần quan trọng nhất)_

**Nói:**

> Để giải quyết, đề tài đề xuất một nền tảng trực tuyến với **bốn vai trò**:

| Vai trò                       | Làm gì trong hệ thống                                          |
| ----------------------------- | -------------------------------------------------------------- |
| 🏢 **Doanh nghiệp (Partner)** | Nạp ngân sách → tạo chiến dịch quảng cáo                       |
| 🚗 **Chủ xe (Driver)**        | Đăng ký xe → tham gia chiến dịch → nhận thu nhập hằng tháng    |
| 🔧 **Gara (Garage)**          | Dán decal → chụp ảnh minh chứng (4 góc xe)                     |
| 🛡️ **Quản trị viên (Admin)**  | Ghép chiến dịch với xe/chủ xe, duyệt ảnh, kiểm soát thanh toán |

**Điểm khác biệt (nhấn mạnh — đây là chỗ ăn điểm):**

1. **Vòng xác minh bằng ảnh:** Chủ xe **chỉ bắt đầu được tính tiền sau khi** gara dán decal, tải ảnh 4 góc và **Admin duyệt ảnh**. → Chống gian lận "nhận tiền nhưng không dán".
2. **Khóa ngân sách an toàn (budget reserve):** Khi doanh nghiệp tạo chiến dịch, hệ thống **khóa toàn bộ ngân sách** trong một giao dịch nguyên tử (atomic) ở cơ sở dữ liệu → không thể chi vượt, không thể âm tiền.
3. **Thanh toán thật:** Tích hợp **SePay (VietQR)** để doanh nghiệp nạp tiền bằng quét mã QR như chuyển khoản ngân hàng thật.

---

## 5. CÁC CHỨC NĂNG CHÍNH

**🚗 Chủ xe (Driver)**

- Đăng ký / đăng nhập (Google, GitHub), chọn vai trò
- Cập nhật hồ sơ, biển số xe, tài khoản nhận tiền
- Chọn gara dán decal
- Xem thu nhập hằng tháng & **lập hóa đơn rút tiền**

**🏢 Doanh nghiệp (Partner)**

- Hoàn thiện hồ sơ doanh nghiệp
- **Nạp tiền theo gói** (quét VietQR qua SePay)
- **Tạo chiến dịch** với ngân sách được khóa tự động
- Xem tổng quan chiến dịch & hóa đơn/chi phí

**🔧 Gara (Garage)**

- Xem công việc lắp decal được giao
- **Tải ảnh minh chứng** sau khi dán
- Xem nguồn thu & tạo yêu cầu rút tiền

**🛡️ Quản trị viên (Admin)**

- Quản lý chiến dịch, **gán chủ xe + xe** vào chiến dịch
- **Kiểm tra ảnh minh chứng** (duyệt/từ chối)
- Quản lý hóa đơn & thanh toán, báo cáo thống kê
- Cấu hình thông số hệ thống, quản lý người dùng/vai trò

---

## 6. KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ

**Nói:**

> Hệ thống được xây dựng theo kiến trúc **monolith hợp nhất một lần triển khai**, chia theo từng vai trò, dùng nền tảng Next.js fullstack kết hợp Supabase.

**Công nghệ sử dụng (ĐÚNG stack thật):**

| Tầng                | Công nghệ                                                                          |
| ------------------- | ---------------------------------------------------------------------------------- |
| Giao diện + Backend | **Next.js 16** (App Router) — fullstack, Server Actions + Route Handlers `/api/v1` |
| Cơ sở dữ liệu       | **Supabase (PostgreSQL)**                                                          |
| Xác thực            | **Supabase Auth** — OAuth Google + GitHub                                          |
| Lưu trữ ảnh         | **Supabase Storage** (signed URL)                                                  |
| Giao diện UI        | **shadcn/ui + Tailwind CSS v4**                                                    |
| Truy vấn dữ liệu    | **TanStack Query**                                                                 |
| Thanh toán          | **SePay (VietQR)**                                                                 |
| Bảo mật dữ liệu     | **RLS (Row Level Security)** — chặn mặc định, thao tác tiền qua service-role       |
| Triển khai          | **Vercel** (+ Cron job)                                                            |

**Sơ đồ cần trình bày kèm (đã có sẵn trong `docs/`):**

- Sơ đồ Use Case tổng quát (`docs/use-case-overview.md`)
- Sơ đồ lớp / ERD (`docs/class-diagram.md`)
- Sơ đồ tuần tự nghiệp vụ chính (`docs/sequence-usecases.md`)

**Máy trạng thái (state machine) — nói 1 câu để gây ấn tượng:**

> Mỗi chiến dịch và hợp đồng đi qua các trạng thái rõ ràng: `chiến dịch: nháp → duyệt → chờ dán → đang chạy → hoàn thành`. Các bước liên quan đến tiền **không thể đổi trạng thái trực tiếp từ giao diện** mà phải qua hàm xử lý phía máy chủ → đảm bảo an toàn.

---

## 7. DEMO HỆ THỐNG ⭐ _(phần hội đồng thích nhất — chỉ demo LUỒNG CỐT LÕI)_

**Kịch bản demo theo đúng "vòng đời 1 chiến dịch":**

1. **Đăng nhập** Doanh nghiệp → **Nạp tiền** (hiện mã VietQR qua SePay).
2. Doanh nghiệp **Tạo chiến dịch** → hệ thống **khóa ngân sách** (cho hội đồng thấy số dư bị trừ).
3. Đăng nhập **Admin** → **Gán chủ xe + xe** vào chiến dịch.
4. Đăng nhập **Chủ xe** → **Chọn gara** dán decal.
5. Đăng nhập **Gara** → **Tải ảnh minh chứng** (4 góc xe).
6. **Admin duyệt ảnh** → hợp đồng chuyển sang **"đang chạy"**, chủ xe **bắt đầu được tính tiền**.
7. Chủ xe **xem thu nhập** → **lập hóa đơn rút tiền** → Admin **duyệt & thanh toán**.

> 💡 **Mẹo tự tin:** Đừng demo hết mọi nút. Chỉ chạy đúng 7 bước trên — đó là "Core Business Flow". Nếu mạng/máy trục trặc, chuẩn bị sẵn **video quay màn hình** hoặc **ảnh chụp** từng bước (đã có `docs/screenshots/`).

---

## 8. KẾT QUẢ ĐẠT ĐƯỢC

- Hoàn thành nền tảng kết nối **4 vai trò** trên một hệ thống thống nhất.
- Tích hợp **đăng nhập OAuth** (Google/GitHub) và **thanh toán VietQR thật** qua SePay.
- Xây dựng **cơ chế khóa ngân sách an toàn** và **vòng xác minh ảnh chống gian lận**.
- Quản lý trọn vòng đời chiến dịch: tạo → ghép → dán → duyệt → tính tiền → rút tiền → báo cáo.
- Đảm bảo **an toàn dữ liệu** bằng RLS chặn-mặc-định; mọi thao tác tiền tách riêng qua máy chủ.
- Giao diện responsive, mobile-first (chủ xe dùng như app trên điện thoại — PWA).

---

## 9. HẠN CHẾ _(hội đồng rất thích — hãy thành thật)_

- Chỉ chạy nền **web/PWA**, **chưa có app native** iOS/Android.
- Thanh toán cho chủ xe/gara còn **chuyển khoản thủ công** (Admin duyệt rồi chuyển tay), chưa tự động hóa hoàn toàn.
- **Chưa tính thu nhập theo GPS/quãng đường** (đã bỏ khỏi phạm vi giai đoạn này).
- **Chưa xuất hóa đơn điện tử** tự động (mới chuẩn bị, kích hoạt khi đủ ngưỡng doanh thu).
- **Chưa có AI** gợi ý ghép xe–chiến dịch; việc ghép vẫn do Admin làm thủ công.
- Mới **thử nghiệm quy mô nhỏ** (pilot Hà Nội), chưa kiểm chứng tải lớn nhiều người dùng.

---

## 10. HƯỚNG PHÁT TRIỂN

- Tích hợp **GPS** để theo dõi quãng đường và tính thu nhập theo km thực tế.
- Xây dựng **ứng dụng di động native** cho chủ xe.
- **Tự động hóa thanh toán** và **xuất hóa đơn điện tử** (VNPT/Misa).
- Ứng dụng **AI** gợi ý ghép phương tiện ↔ chiến dịch phù hợp (theo khu vực, tệp khách).
- **Phân tích hiệu quả chiến dịch** (lượt tiếp cận, khu vực phủ sóng).
- **Mở rộng đa thành phố**, hỗ trợ thêm xe máy.

---

## 11. CHUẨN BỊ CÂU HỎI HỘI ĐỒNG _(phần giúp bạn tự tin nhất)_

| Hội đồng có thể hỏi                                            | Trả lời gợi ý                                                                                                                                                                                 |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **"Làm sao chống gian lận chủ xe nhận tiền nhưng không dán?"** | Chủ xe chỉ được tính tiền **sau khi** gara tải ảnh 4 góc **và** Admin duyệt ảnh. Không có ảnh duyệt → không có thu nhập.                                                                      |
| **"Tiền của doanh nghiệp có bị chi vượt không?"**              | Không. Khi tạo chiến dịch, toàn bộ ngân sách bị **khóa trong một giao dịch nguyên tử** ở database; số dư khả dụng bị trừ ngay, không thể âm.                                                  |
| **"Sao không dùng Node/Express + MySQL?"**                     | Em chọn **Next.js fullstack + Supabase (PostgreSQL)** để gộp frontend–backend–auth–database–storage trong một nền tảng, giảm hạ tầng phải tự dựng, và **bảo mật ở tầng dữ liệu bằng RLS**.    |
| **"Bảo mật dữ liệu thế nào?"**                                 | **RLS chặn mặc định** — mỗi bảng có chính sách riêng, người dùng chỉ thấy dữ liệu của mình. Mọi thao tác tiền đi qua máy chủ (service-role), client **không bao giờ ghi thẳng** vào database. |
| **"Thanh toán có thật không?"**                                | Có — tích hợp **SePay VietQR**: doanh nghiệp quét mã chuyển khoản, webhook xác nhận và cộng tiền tự động.                                                                                     |
| **"Đóng góp/điểm mới của đề tài?"**                            | Mô hình **4 bên có khâu xác minh ảnh** + **kiểm soát dòng tiền ở tầng database** — khác với các sàn kết nối thông thường chỉ dừng ở "ghép đôi".                                               |

---

_Tài liệu ôn tập bảo vệ đồ án — bám sát hệ thống thật (Wheels Earner / Vehical Advertise pilot Hà Nội)._
