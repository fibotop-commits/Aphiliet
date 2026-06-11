document.addEventListener('DOMContentLoaded', () => {
      const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vT-QfwWFBoh66hPyqSMC-uBBCVR1buTWTbkjN8XsjCn0Q3EEtclBZvFanUsFA7K17nrOX
  uhhw0dR2tJ/pub?output=csv'; 
      const siteTitle = "Tuyển Tập Review Chất";
      document.getElementById('site-title').textContent = siteTitle;
      document.documentElement.style.setProperty('--shopee-color', "#ee4d2d");
      document.documentElement.style.setProperty('--tiktok-color', "#000000");

      const videoContainer = document.getElementById('video-container');
      const galleryContainer = document.getElementById('gallery-container');

      videoContainer.innerHTML = '<div style="text-align:center; padding: 50px; font-weight: bold; color:
  var(--primary-color);">Đang tải dữ liệu từ Google Sheets... <br><br> <i class="fa-solid fa-spinner fa-spin
  fa-2x"></i></div>';

      loadData();

      async function loadData() {
          try {
              if (!SHEET_CSV_URL || SHEET_CSV_URL === 'DÁN_LINK_CSV_CỦA_BẠN_VÀO_ĐÂY') {
                  return;
              }

              const response = await fetch(SHEET_CSV_URL);
              if (!response.ok) throw new Error("Không thể tải file CSV.");
              const csvText = await response.text();
              const rows = parseCSV(csvText);
              const dataRows = rows.slice(1);

              const videosMap = new Map();
              let currentVideoId = '';
              let currentVideoTitle = '';
              let currentEmbedCode = '';

              dataRows.forEach((row, index) => {
                  if (row.length < 3) return; 

                  if (row[0] && row[0].trim() !== '') currentVideoId = row[0].trim();
                  if (row[1] && row[1].trim() !== '') currentVideoTitle = row[1].trim();
                  if (row[2] && row[2].trim() !== '') {
                      let code = row[2].trim();
                      if (code.startsWith('http') && !code.includes('<iframe') && !code.includes('<blockquote')) {
                          if (code.includes('tiktok.com') && code.includes('/video/')) {
                              const videoIdMatch = code.match(/\/video\/(\d+)/);
                              const videoId = videoIdMatch ? videoIdMatch[1] : '';
                              if (videoId) {
                                  code = `
                                  <div style="display:flex; justify-content:center; width:100%; border-radius: 12px;
  overflow: hidden; height: 500px;">
                                      <iframe src="https://www.tiktok.com/embed/v2/${videoId}" style="width: 100%;
  height: 100%; border: none; overflow: hidden;" allowfullscreen="true" allow="autoplay; clipboard-write;
  encrypted-media; picture-in-picture; web-share"></iframe>
                                  </div>
                                  `;
                              }
                          } else if (code.includes('/reel/') || code.includes('/share/r/')) {
                              code = `
                              <div style="background: #f0f2f5; display:flex; flex-direction:column; align-items:center;
  justify-content:center; height: 100%; min-height: 250px; text-align:center; padding: 20px;">
                                  <i class="fa-brands fa-facebook" style="font-size: 3rem; color: #0866ff;
  margin-bottom: 15px;"></i>
                                  <h3 style="font-size: 1.1rem; margin-bottom: 10px; color: #1c1e21;">Video Reels của
  Facebook</h3>
                                  <p style="font-size: 0.9rem; color: #65676b; margin-bottom: 20px;">Video này chứa bản
  quyền, vui lòng xem trực tiếp trên ứng dụng Facebook.</p>
                                  <a href="${code}" target="_blank" rel="noopener noreferrer" style="background:
  #0866ff; color: white; padding: 10px 24px; border-radius: 20px; text-decoration: none; font-weight: 600; display:
  inline-flex; align-items: center; gap: 8px;">
                                      <i class="fa-solid fa-arrow-up-right-from-square"></i> Mở Facebook Xem Ngay
                                  </a>
                              </div>`;
                          } else {
                              code = <iframe
  src="https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(code)}&show_text=false&width=auto"
  width="100%" height="400" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true"
  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>;
                          }
                      }
                      currentEmbedCode = code;
                  }

                  const prodName = row[3] ? row[3].trim() : '';
                  const platform = row[4] ? row[4].trim() : 'shopee';
                  const price = row[5] ? row[5].trim() : '';
                  const imageUrl = row[6] ? row[6].trim() : '';
                  if (!videosMap.has(currentVideoId)) {
                      videosMap.set(currentVideoId, {
                          id: currentVideoId,
                          title: currentVideoTitle,
                          embedCode: currentEmbedCode,
                          products: []
                      });
                  }

                  if (prodName && affiliateLink) {
                      videosMap.get(currentVideoId).products.push({
                          id: currentVideoId + '-prod-' + index, 
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
                  videoContainer.innerHTML = '<div style="text-align:center; padding: 50px;">Không tìm thấy video nào.
  Vui lòng kiểm tra lại Google Sheet.</div>';
                  return;
              }

              renderApp(videos);

          } catch (error) {
              console.error("Lỗi khi tải dữ liệu:", error);
              let errorMsg = error.message;
              if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
                  errorMsg = Trình duyệt chặn kết nối (CORS). Hãy up lên GitHub Pages.;
              }
              videoContainer.innerHTML = <div style="text-align:center; color: #d0021b; padding: 40px
  20px;">${errorMsg}</div>;
          }
      }

      async function renderApp(videosData) {
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
                      <div class="video-wrapper" style="padding-bottom:0; height:auto;">
                          ${video.embedCode}
                      </div>
                      ${productSection}
                  </article>
              `;
          }
          videoContainer.innerHTML = videoFeedHTML;

          let allProducts = [];
          videosData.forEach(video => {
              allProducts = allProducts.concat(video.products);
          });

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
          galleryContainer.innerHTML = galleryHTML || '<div style="padding:20px;text-align:center;">Chưa có sản phẩm
  nào.</div>';

          setupEvents();
      }

      async function createProductHTML(product) {
          const isShopee = product.platform.includes('shopee');
          const btnClass = isShopee ? 'btn-shopee' : 'btn-tiktok';
          const iconClass = isShopee ? 'fa-bag-shopping' : 'fa-tiktok';
          const btnText = isShopee ? 'Mua trên Shopee' : 'Mua trên TikTok';
          const pulseClass = isShopee ? 'pulse' : ''; 

          let finalImgUrl = product.imageUrl;

          if (!finalImgUrl || finalImgUrl.trim() === '') {
              try {
                  const res = await fetch('https://api.microlink.io/?url=' + encodeURIComponent(product.affiliateLink));
                  const data = await res.json();
                  if (data.status === 'success') {
                      finalImgUrl = data.data?.image?.url || data.data?.logo?.url ||
  'https://via.placeholder.com/100?text=No+Image';
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
                  <a href="{product.affiliateLink}" target="_blank" rel="noopener noreferrer" class="btn-buy {btnClass}
  ${pulseClass}">
                      <i class="fa-solid ${iconClass}"></i> ${btnText}
                  </a>
              </div>
          `;
      }

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
  });
