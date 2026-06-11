1 document.addEventListener('DOMContentLoaded', () => {
     2     const SHEET_CSV_URL =
       'https://docs.google.com/spreadsheets/d/e/2PACX-1vT-QfwWFBoh66hPyqSMC-uBBCVR1buTWTbkjN8XsjCn0Q3EEtclBZvFanUsFA7K1
       7nrOXuhhw0dR2tJ/pub?output=csv'; 
     3     const siteTitle = "Tuyển Tập Review Chất";
     4     document.getElementById('site-title').textContent = siteTitle;
     5     document.documentElement.style.setProperty('--shopee-color', "#ee4d2d");
     6     document.documentElement.style.setProperty('--tiktok-color', "#000000");
     7
     8     const videoContainer = document.getElementById('video-container');
     9     const galleryContainer = document.getElementById('gallery-container');
    10
    11     videoContainer.innerHTML = '<div style="text-align:center; padding: 50px; font-weight: bold; color:
       var(--primary-color);">Đang tải dữ liệu từ Google Sheets... <br><br> <i class="fa-solid fa-spinner fa-spin
       fa-2x"></i></div>';
    12
    13     loadData();
    14
    15     async function loadData() {
    16         try {
    17             if (!SHEET_CSV_URL || SHEET_CSV_URL === 'DÁN_LINK_CSV_CỦA_BẠN_VÀO_ĐÂY') {
    18                 return;
    19             }
    20
    21             const response = await fetch(SHEET_CSV_URL);
    22             if (!response.ok) throw new Error("Không thể tải file CSV.");
    23             const csvText = await response.text();
    24             const rows = parseCSV(csvText);
    25             const dataRows = rows.slice(1);
    26             
    27             const videosMap = new Map();
    28             let currentVideoId = '';
    29             let currentVideoTitle = '';
    30             let currentEmbedCode = '';
    31             
    32             dataRows.forEach((row, index) => {
    33                 if (row.length < 3) return; 
    34                 
    35                 if (row[0] && row[0].trim() !== '') currentVideoId = row[0].trim();
    36                 if (row[1] && row[1].trim() !== '') currentVideoTitle = row[1].trim();
    37                 if (row[2] && row[2].trim() !== '') {
    38                     let code = row[2].trim();
    39                     if (code.startsWith('http') && !code.includes('<iframe') && !code.includes('<blockquote')) {
    40                         if (code.includes('tiktok.com') && code.includes('/video/')) {
    41                             const videoIdMatch = code.match(/\/video\/(\d+)/);
    42                             const videoId = videoIdMatch ? videoIdMatch[1] : '';
    43                             if (videoId) {
    44                                 code = `
    45                                 <div style="display:flex; justify-content:center; width:100%; border-radius:
       12px; overflow: hidden; height: 500px;">
    46                                     <iframe src="https://www.tiktok.com/embed/v2/${videoId}" style="width: 100%;
       height: 100%; border: none; overflow: hidden;" allowfullscreen="true" allow="autoplay; clipboard-write;
       encrypted-media; picture-in-picture; web-share"></iframe>
    47                                 </div>
    48                                 `;
    49                             }
    50                         } else if (code.includes('/reel/') || code.includes('/share/r/')) {
    51                             code = `
    52                             <div style="background: #f0f2f5; display:flex; flex-direction:column;
       align-items:center; justify-content:center; height: 100%; min-height: 250px; text-align:center; padding: 20px;">
    53                                 <i class="fa-brands fa-facebook" style="font-size: 3rem; color: #0866ff;
       margin-bottom: 15px;"></i>
    54                                 <h3 style="font-size: 1.1rem; margin-bottom: 10px; color: #1c1e21;">Video Reels
       của Facebook</h3>
    55                                 <p style="font-size: 0.9rem; color: #65676b; margin-bottom: 20px;">Video này chứa
       bản quyền, vui lòng xem trực tiếp trên ứng dụng Facebook.</p>
    56                                 <a href="${code}" target="_blank" rel="noopener noreferrer" style="background:
       #0866ff; color: white; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-weight: 600; display:
       inline-flex; align-items: center; gap: 8px;">
    57                                     <i class="fa-solid fa-arrow-up-right-from-square"></i> Mở Facebook Xem Ngay
    58                                 </a>
    59                             </div>`;
    60                         } else {
    61                             code = `<iframe
       src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(code)}&show_text=false&width=auto"
       width="100%" height="400" style="border:none;overflow:hidden" scrolling="no" frameborder="0"
       allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture;
       web-share"></iframe>`;
    62                         }
    63                     }
    64                     currentEmbedCode = code;
    65                 }
    66                 
    67                 const prodName = row[3] ? row[3].trim() : '';
    68                 const platform = row[4] ? row[4].trim() : 'shopee';
    69                 const price = row[5] ? row[5].trim() : '';
    70                 const imageUrl = row[6] ? row[6].trim() : '';
    71                 const affiliateLink = row[7] ? row[7].trim() : '';
    72                 
    73                 if (!currentVideoId || !currentEmbedCode) return;
    74
    75                 if (!videosMap.has(currentVideoId)) {
    76                     videosMap.set(currentVideoId, {
    77                         id: currentVideoId,
    78                         title: currentVideoTitle,
    79                         embedCode: currentEmbedCode,
    80                         products: []
    81                     });
    82                 }
    83                 
    84                 if (prodName && affiliateLink) {
    85                     videosMap.get(currentVideoId).products.push({
    86                         id: currentVideoId + '-prod-' + index, 
    87                         name: prodName,
    88                         platform: platform.toLowerCase(),
    89                         price: price,
    90                         imageUrl: imageUrl,
    91                         affiliateLink: affiliateLink
    92                     });
    93                 }
    94             });
    95
    96             const videos = Array.from(videosMap.values());
    97             if (videos.length === 0) {
    98                 videoContainer.innerHTML = '<div style="text-align:center; padding: 50px;">Không tìm thấy video
       nào. Vui lòng kiểm tra lại Google Sheet.</div>';
    99                 return;
   100             }
   101
   102             renderApp(videos);
   103
   104         } catch (error) {
   105             console.error("Lỗi khi tải dữ liệu:", error);
   106             let errorMsg = error.message;
   107             if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
   108                 errorMsg = `Trình duyệt chặn kết nối (CORS). Hãy up lên GitHub Pages.`;
   109             }
   110             videoContainer.innerHTML = `<div style="text-align:center; color: #d0021b; padding: 40px
       20px;">${errorMsg}</div>`;
   111         }
   112     }
   113
   114     async function renderApp(videosData) {
   115         let videoFeedHTML = '';
   116         for (const video of videosData) {
   117             let productsHTML = '';
   118             for (const product of video.products) {
   119                 productsHTML += await createProductHTML(product);
   120             }
   121
   122             const productSection = productsHTML ? `
   123                 <div class="video-products-list">
   124                     <h4>Sản phẩm trong video</h4>
   125                     ${productsHTML}
   126                 </div>` : '';
   127
   128             videoFeedHTML += `
   129                 <article class="video-card">
   130                     <div class="video-header">
   131                         <h2 class="video-title">${video.title}</h2>
   132                     </div>
   133                     <div class="video-wrapper" style="padding-bottom:0; height:auto;">
   134                         ${video.embedCode}
   135                     </div>
   136                     ${productSection}
   137                 </article>
   138             `;
   139         }
   140         videoContainer.innerHTML = videoFeedHTML;
   141
   142         let allProducts = [];
   143         videosData.forEach(video => {
   144             allProducts = allProducts.concat(video.products);
   145         });
   146
   147         const uniqueProducts = [];
   148         const linkMap = new Map();
   149         for (const item of allProducts) {
   150             if(!linkMap.has(item.affiliateLink)){
   151                 linkMap.set(item.affiliateLink, true);
   152                 uniqueProducts.push(item);
   153             }
   154         }
   155
   156         let galleryHTML = '';
   157         for (const product of uniqueProducts) {
   158             galleryHTML += await createProductHTML(product);
   159         }
   160         galleryContainer.innerHTML = galleryHTML || '<div style="padding:20px;text-align:center;">Chưa có sản
       phẩm nào.</div>';
   161
   162         setupEvents();
   163     }
   164
   165     async function createProductHTML(product) {
   166         const isShopee = product.platform.includes('shopee');
   167         const btnClass = isShopee ? 'btn-shopee' : 'btn-tiktok';
   168         const iconClass = isShopee ? 'fa-bag-shopping' : 'fa-tiktok';
   169         const btnText = isShopee ? 'Mua trên Shopee' : 'Mua trên TikTok';
   170         const pulseClass = isShopee ? 'pulse' : ''; 
   171
   172         let finalImgUrl = product.imageUrl;
   173
   174         if (!finalImgUrl || finalImgUrl.trim() === '') {
   175             try {
   176                 const res = await fetch('https://api.microlink.io/?url=' +
       encodeURIComponent(product.affiliateLink));
   177                 const data = await res.json();
   178                 if (data.status === 'success') {
   179                     finalImgUrl = data.data?.image?.url || data.data?.logo?.url ||
       'https://via.placeholder.com/100?text=No+Image';
   180                 }
   181             } catch (e) {
   182                 finalImgUrl = 'https://via.placeholder.com/100?text=No+Image';
   183             }
   184         }
   185
   186         return `
   187             <div class="product-item" data-platform="${product.platform}">
   188                 <img src="${finalImgUrl}" alt="${product.name}" class="product-img" loading="lazy">
   189                 <div class="product-info">
   190                     <h3 class="product-name" title="${product.name}">${product.name}</h3>
   191                     <div class="product-price">${product.price}</div>
   192                 </div>
   193                 <a href="${product.affiliateLink}" target="_blank" rel="noopener noreferrer" class="btn-buy
       ${btnClass} ${pulseClass}">
   194                     <i class="fa-solid ${iconClass}"></i> ${btnText}
   195                 </a>
   196             </div>
   197         `;
   198     }
   199
   200     function setupEvents() {
   201         const tabBtns = document.querySelectorAll('.tab-btn');
   202         const tabContents = document.querySelectorAll('.tab-content');
   203
   204         tabBtns.forEach(btn => {
   205             btn.addEventListener('click', () => {
   206                 tabBtns.forEach(b => b.classList.remove('active'));
   207                 tabContents.forEach(c => c.classList.remove('active'));
   208                 btn.classList.add('active');
   209                 document.getElementById(btn.getAttribute('data-target')).classList.add('active');
   210             });
   211         });
   212
   213         const filterBtns = document.querySelectorAll('.filter-btn');
   214         filterBtns.forEach(btn => {
   215             btn.addEventListener('click', () => {
   216                 filterBtns.forEach(b => b.classList.remove('active'));
   217                 btn.classList.add('active');
   218
   219                 const filterValue = btn.getAttribute('data-filter');
   220                 const productItems = galleryContainer.querySelectorAll('.product-item');
   221
   222                 productItems.forEach(item => {
   223                     if (filterValue === 'all' || item.getAttribute('data-platform') === filterValue) {
   224                         item.style.display = 'flex';
   225                     } else {
   226                         item.style.display = 'none';
   227                     }
   228                 });
   229             });
   230         });
   231     }
   232
   233     function parseCSV(str) {
   234         const arr = [];
   235         let quote = false;
   236         let row = 0, col = 0, c = 0;
   237         for (; c < str.length; c++) {
   238             let cc = str[c], nc = str[c+1];
   239             arr[row] = arr[row] || [];
   240             arr[row][col] = arr[row][col] || '';
   241
   242             if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
   243             if (cc == '"') { quote = !quote; continue; }
   244             if (cc == ',' && !quote) { ++col; continue; }
   245             if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
   246             if (cc == '\n' && !quote) { ++row; col = 0; continue; }
   247             if (cc == '\r' && !quote) { ++row; col = 0; continue; }
   248
   249             arr[row][col] += cc;
   250         }
   251         return arr;
   252     }
   253 });
