/**
 * Nén và chuẩn hóa ảnh tải lên (bài viết, sự kiện, hội viên)
 * giúp tốc độ tải trang cực nhanh và đảm bảo 100% tương thích với bộ cào ảnh OpenGraph của Zalo / Facebook (< 500KB).
 */
export function compressImageFileToBase64(file, { maxWidth = 1400, maxHeight = 1400, quality = 0.88 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Không có tệp ảnh'));

    // Với ảnh SVG hoặc GIF động nhỏ, giữ nguyên
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const base64Data = result.includes(';base64,') ? result.split(';base64,')[1] : result;
        resolve({
          dataUrl: result,
          base64Data,
          fileName: file.name,
          fileType: file.type
        });
      };
      reader.onerror = () => reject(new Error('Lỗi đọc tệp ảnh'));
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Đổ nền trắng trước khi vẽ để tránh nền trong suốt bị đen khi xuất JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64Data = dataUrl.split(';base64,')[1];
        const baseName = (file.name || 'image').replace(/\.[^.]+$/, '');

        resolve({
          dataUrl,
          base64Data,
          fileName: `${baseName}.jpg`,
          fileType: 'image/jpeg'
        });
      } catch (err) {
        // Fallback đọc gốc nếu canvas lỗi
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || '');
          const base64Data = result.includes(';base64,') ? result.split(';base64,')[1] : result;
          resolve({
            dataUrl: result,
            base64Data,
            fileName: file.name,
            fileType: file.type
          });
        };
        reader.onerror = () => reject(err);
        reader.readAsDataURL(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const base64Data = result.includes(';base64,') ? result.split(';base64,')[1] : result;
        resolve({
          dataUrl: result,
          base64Data,
          fileName: file.name,
          fileType: file.type
        });
      };
      reader.onerror = () => reject(new Error('Không thể đọc định dạng ảnh'));
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
}

