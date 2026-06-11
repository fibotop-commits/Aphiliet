document.addEventListener('DOMContentLoaded', () => {
    // ========================================================================
    // 1. CẤU HÌNH LINK GOOGLE SHEET (DẠNG CSV)
    // ========================================================================
    // Thay đường link bên dưới bằng link CSV bạn lấy được từ Google Sheets.
    // Nếu để trống hoặc giữ nguyên chữ 'DÁN_LINK_CSV_CỦA_BẠN_VÀO_ĐÂY', 
    // web sẽ hiển thị dữ liệu mẫu để bạn xem trước giao diện.
    const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT-QfwWFBoh66hPyqSMC-uBBCVR1buTWTbkjN8XsjCn0Q3EEtclBZvFanUsFA7K17nrOXuhhw0dR2tJ/pub?output=csv'; 
    
    // Cài đặt tên và màu sắc
    const siteTitle = "Tuyển Tập Review Chất";
    document.getElementById('site-title').textContent = siteTitle;
    document.documentElement.style.setProperty('--shopee-color', "#ee4d2d");
    document.documentElement.style.setProperty('--tiktok-color', "#000000");

    const videoContainer = document.getElementById('video-container');
    const galleryContainer = document.getElementById('gallery-container');

    // ========================================================================
    // 2. KHỞI CHẠY ỨNG DỤNG VÀ TẢI DỮ LIỆU
    // ========================================================================
    videoContainer.innerHTML = '<div style="text-align:center; padding: 50px; font-weight: bold; color: var(--primary-color);">Đang tải dữ liệu từ Google Sheets... <br><br> <i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>';

    loadData();

    async function loadData() {
        try {
            // Kiểm tra xem đã dán link chưa
            if (!SHEET_CSV_URL || SHEET_CSV_URL === 'DÁN_LINK_CSV_CỦA_BẠN_VÀO_ĐÂY') {
                console.log("Đang dùng dữ liệu mẫu vì chưa có link Google Sheets.");
                renderApp(getMockData());
                return;
            }

            // Lấy trực tiếp không qua proxy. Lưu ý: Khi mở file:// sẽ bị lỗi CORS, nhưng đẩy lên GitHub Pages sẽ hoạt động bình thường.
            const response = await fetch(SHEET_CSV_URL);
            if (!response.ok) throw new Error("Không thể tải file CSV. Bạn đã Publish Google Sheet chưa?");
            const csvText = await response.text();
            
            const rows = parseCSV(csvText);
            const dataRows = rows.slice(1); // Bỏ qua dòng 1 (tiêu đề cột)
            
            const videosMap = new Map();
            let currentVideoId = '';
            let currentVideoTitle = '';
            let currentEmbedCode = '';
            
            // Xử lý từng dòng trong file Excel
            dataRows.forEach((row, index) => {
                if (row.length < 3) return; // Dòng trống
                
                // Các cột tương ứng: A, B, C, D, E, F, G, H
                // Nếu cột A, B, C có dữ liệu, cập nhật current. Nếu trống, lấy current cũ.
                if (row[0] && row[0].trim() !== '') currentVideoId = row[0].trim();
                if (row[1] && row[1].trim() !== '') currentVideoTitle = row[1].trim();
                if (row[2] && row[2].trim() !== '') {
                    let code = row[2].trim();
                    // Nếu user dán nhầm link thường thay vì iframe
                    if (code.startsWith('http') && !code.includes('<iframe') && !code.includes('<blockquote')) {
                        
                        // 1. Nhận diện Link Tiktok thường -> Tự tạo mã Iframe TikTok V2 (An toàn tuyệt đối)
                        if (code.includes('tiktok.com') && code.includes('/video/')) {
                            const videoIdMatch = code.match(/\/video\/(\d+)/);
                            const videoId = videoIdMatch ? videoIdMatch[1] : '';
                            if (videoId) {
                                code = `
                                <div style="display:flex; justify-content:center; width:100%; border-radius: 12px; overflow: hidden; height: 500px;">
                                    <iframe src="https://www.tiktok.com/embed/v2/${videoId}" style="width: 100%; height: 100%; border: none; overflow: hidden;" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>
                                </div>
                                `;
                            }
                        } 
                        // 2. Nhận diện Facebook Reels (bị chặn Iframe)
                        else if (code.includes('/reel/') || code.includes('/share/r/')) {
                            code = `
                            <div style="background: #f0f2f5; display:flex; flex-direction:column; align-items:center; justify-content:center; height: 100%; min-height: 250px; text-align:center; padding: 20px;">
                                <i class="fa-brands fa-facebook" style="font-size: 3rem; color: #0866ff; margin-bottom: 15px;"></i>
                                <h3 style="font-size: 1.1rem; margin-bottom: 10px; color: #1c1e21;">Video Reels của Facebook</h3>
                                <p style="font-size: 0.9rem; color: #65676b; margin-bottom: 20px;">Video này chứa bản quyền, vui lòng xem trực tiếp trên ứng dụng Facebook.</p>
                                <a href="${code}" target="_blank" rel="noopener noreferrer" style="background: #0866ff; color: white; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
                                    <i class="fa-solid fa-arrow-up-right-from-square"></i> Mở Facebook Xem Ngay
                                </a>
                            </div>`;
                        } 
                        // 3. Các link FB thường
                        else {
                            code = `<iframe src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(code)}&show_text=false&width=auto" width="100%" height="400" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;
                        }
                    }
                    currentEmbedCode = code;
                }
                
                const prodName = row[3] ? row[3].trim() : '';
                const platform = row[4] ? row[4].trim() : 'shopee';
                const price = row[5] ? row[5].trim() : '';
                const imageUrl = row[6] ? row[6].trim() : '';
                const affiliateLink = row[7] ? row[7].trim() : '';
                
                if (!currentVideoId || !currentEmbedCode) return; // Bắt buộc phải có ID và mã nhúng

                if (!videosMap.has(currentVideoId)) {
                    videosMap.set(currentVideoId, {
                        id: currentVideoId,
                        title: currentVideoTitle,
                        embedCode: currentEmbedCode,
                        products: []
                    });
                }
                
                // Nếu dòng này có chứa thông tin sản phẩm
                if (prodName && affiliateLink) {
                    videosMap.get(currentVideoId).products.push({
                        id: currentVideoId + '-prod-' + index, // Tạo ID duy nhất cho sản phẩm
                        name: prodName,
                        platform: platform.toLowerCase(),
                        price: price,
                        imageUrl: imageUrl,
                        affiliateLink: affiliateLink
                    });
                }
            });

            const videos = Array.from(videosMap.values());
            if (videos.length === 0) {
                videoContainer.innerHTML = '<div style="text-align:center; padding: 50px;">Không tìm thấy video nào. Vui lòng kiểm tra lại Google Sheet.</div>';
                return;
            }

            renderApp(videos);

        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            let errorMsg = error.message;
            if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
                errorMsg = `
                    <div style="font-size: 1.1rem; line-height: 1.5;">
                        Trình duyệt đang <b>chặn kết nối</b> do bạn mở file trực tiếp trên máy tính (lỗi bảo mật CORS).<br><br>
                        ✨ <b>Đây không phải là lỗi code!</b> ✨<br><br>
                        Bạn chỉ cần <b>Đẩy trang web này lên GitHub Pages</b> (như hướng dẫn trong file README.md), trang web sẽ có link chính thức và dữ liệu từ Google Sheets sẽ hiện ra 100%!
                    </div>
                `;
            }
            videoContainer.innerHTML = `<div style="text-align:center; color: #d0021b; padding: 40px 20px;">${errorMsg}</div>`;
        }
    }

    // ========================================================================
    // 3. HIỂN THỊ LÊN GIAO DIỆN CHÍNH
    // ========================================================================
    async function renderApp(videosData) {
        // --- Render Tab 1: Video Feed ---
        let videoFeedHTML = '';
        for (const video of videosData) {
            let productsHTML = '';
            for (const product of video.products) {
                productsHTML += await createProductHTML(product);
            }

            const productSection = productsHTML ? `
                <div class="video-products-list">
                    <h4>Sản phẩm trong video</h4>
                    ${productsHTML}
                </div>` : '';

            videoFeedHTML += `
                <article class="video-card">
                    <div class="video-header">
                        <h2 class="video-title">${video.title}</h2>
                    </div>
                    <div class="video-wrapper">
                        ${video.embedCode}
                    </div>
                    ${productSection}
                </article>
            `;
        }
        videoContainer.innerHTML = videoFeedHTML;

        // --- Render Tab 2: Product Gallery ---
        let allProducts = [];
        videosData.forEach(video => {
            allProducts = allProducts.concat(video.products);
        });

        // Lọc trùng lặp sản phẩm (nếu link sản phẩm giống nhau)
        const uniqueProducts = [];
        const linkMap = new Map();
        for (const item of allProducts) {
            if(!linkMap.has(item.affiliateLink)){
                linkMap.set(item.affiliateLink, true);
                uniqueProducts.push(item);
            }
        }

        let galleryHTML = '';
        for (const product of uniqueProducts) {
            galleryHTML += await createProductHTML(product);
        }
        galleryContainer.innerHTML = galleryHTML || '<div style="padding:20px;text-align:center;">Chưa có sản phẩm nào.</div>';

        setupEvents();
    }

    async function createProductHTML(product) {
        const isShopee = product.platform.includes('shopee');
        const btnClass = isShopee ? 'btn-shopee' : 'btn-tiktok';
        const iconClass = isShopee ? 'fa-bag-shopping' : 'fa-tiktok';
        const btnText = isShopee ? 'Mua trên Shopee' : 'Mua trên TikTok';
        const pulseClass = isShopee ? 'pulse' : ''; // Hiệu ứng nhịp đập

        let finalImgUrl = product.imageUrl;

        // TỰ ĐỘNG LẤY ẢNH TỪ LINK NẾU ĐỂ TRỐNG (GIỐNG FACEBOOK LINK PREVIEW)
        if (!finalImgUrl || finalImgUrl.trim() === '') {
            try {
                const res = await fetch('https://api.microlink.io/?url=' + encodeURIComponent(product.affiliateLink));
                const data = await res.json();
                if (data.status === 'success') {
                    finalImgUrl = data.data?.image?.url || data.data?.logo?.url || 'https://via.placeholder.com/100?text=No+Image';
                }
            } catch (e) {
                finalImgUrl = 'https://via.placeholder.com/100?text=No+Image';
            }
        }

        return `
            <div class="product-item" data-platform="${product.platform}">
                <img src="${finalImgUrl}" alt="${product.name}" class="product-img" loading="lazy">
                <div class="product-info">
                    <h3 class="product-name" title="${product.name}">${product.name}</h3>
                    <div class="product-price">${product.price}</div>
                </div>
                <a href="${product.affiliateLink}" target="_blank" rel="noopener noreferrer" class="btn-buy ${btnClass} ${pulseClass}">
                    <i class="fa-solid ${iconClass}"></i> ${btnText}
                </a>
            </div>
        `;
    }

    // ========================================================================
    // 4. SỰ KIỆN CLICK (TAB & FILTER)
    // ========================================================================
    function setupEvents() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(btn.getAttribute('data-target')).classList.add('active');
            });
        });

        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');
                const productItems = galleryContainer.querySelectorAll('.product-item');

                productItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-platform') === filterValue) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // ========================================================================
    // 5. CÁC HÀM HỖ TRỢ (PARSER & MOCK DATA)
    // ========================================================================
    function parseCSV(str) {
        const arr = [];
        let quote = false;
        let row = 0, col = 0, c = 0;
        for (; c < str.length; c++) {
            let cc = str[c], nc = str[c+1];
            arr[row] = arr[row] || [];
            arr[row][col] = arr[row][col] || '';

            if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
            if (cc == '"') { quote = !quote; continue; }
            if (cc == ',' && !quote) { ++col; continue; }
            if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
            if (cc == '\n' && !quote) { ++row; col = 0; continue; }
            if (cc == '\r' && !quote) { ++row; col = 0; continue; }

            arr[row][col] += cc;
        }
        return arr;
    }

    function getMockData() {
        return [
            {
                id: "vid-001",
                title: "Trải nghiệm Đồ dùng tiện ích nhà bếp siêu đỉnh",
                embedCode: `<iframe src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Ffacebook%2Fvideos%2F10153231379946729%2F&show_text=false&width=267&t=0" width="100%" height="400" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen="true"></iframe>`,
                products: [
                    { id: "p1", name: "Máy xay đa năng mini", platform: "shopee", price: "199.000đ", imageUrl: "https://cf.shopee.vn/file/vn-11134207-7r98o-lsi2i0p7qf3f8b_tn", affiliateLink: "#" },
                    { id: "p2", name: "Thớt nhựa chống xước", platform: "tiktok", price: "55.000đ", imageUrl: "https://p16-oec-va.ibyteimg.com/tos-maliva-i-o3syd03w52-us/ba10b06b0d914d79ad46a297ed2fdf06~tplv-o3syd03w52-resize-jpeg:800:800.jpeg", affiliateLink: "#" }
                ]
            },
            {
                id: "vid-002",
                title: "Phối đồ đi chơi cuối tuần chuẩn Hàn",
                embedCode: `<iframe src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Ffacebook%2Fvideos%2F10153231379946729%2F&show_text=false&width=267&t=0" width="100%" height="400" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen="true"></iframe>`,
                products: [
                    { id: "p3", name: "Áo Polo Vải Cotton", platform: "shopee", price: "125.000đ", imageUrl: "https://cf.shopee.vn/file/vn-11134207-7r98o-lsi2i0p7qf3f8b_tn", affiliateLink: "#" }
                ]
            }
        ];
    }
});
