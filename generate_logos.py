import math
from PIL import Image, ImageDraw, ImageFont
import os

def create_brand_icon(size=512):
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    pad = int(size * 0.04)
    r = int(size * 0.22) # rounded corner radius
    
    # Background Squircle / Rounded Rect
    # Gradient coffee dark to bazan
    bg_color = (42, 22, 13, 255) # Deep coffee #2A160D
    draw.rounded_rectangle([pad, pad, size - pad, size - pad], radius=r, fill=bg_color)
    
    # Inner border - Gong Gold
    border_width = max(2, int(size * 0.025))
    gold_border = (213, 163, 63, 220) # #D5A33F
    draw.rounded_rectangle([pad + border_width, pad + border_width, size - pad - border_width, size - pad - border_width], 
                           radius=r - border_width, outline=gold_border, width=border_width)
    
    # Stylized Gong Sunburst / Concentric rings at upper center
    cx, cy = size // 2, int(size * 0.42)
    gong_radius = int(size * 0.26)
    
    # Outer sun rays / dots
    for i in range(16):
        angle = i * (2 * math.pi / 16)
        r_inner = gong_radius + int(size * 0.04)
        r_outer = gong_radius + int(size * 0.08)
        x1 = cx + int(r_inner * math.cos(angle))
        y1 = cy + int(r_inner * math.sin(angle))
        x2 = cx + int(r_outer * math.cos(angle))
        y2 = cy + int(r_outer * math.sin(angle))
        draw.line([x1, y1, x2, y2], fill=(243, 197, 98, 160), width=max(2, int(size * 0.02)))
        
    # Gong ring
    draw.ellipse([cx - gong_radius, cy - gong_radius, cx + gong_radius, cy + gong_radius], 
                 outline=(213, 163, 63, 240), width=max(3, int(size * 0.03)))
    draw.ellipse([cx - int(gong_radius*0.7), cy - int(gong_radius*0.7), cx + int(gong_radius*0.7), cy + int(gong_radius*0.7)], 
                 outline=(243, 197, 98, 180), width=max(2, int(size * 0.018)))

    # Stylized Mountains (Bazan peaks) in lower center
    m_left = int(size * 0.18)
    m_right = int(size * 0.82)
    m_bottom = int(size * 0.72)
    
    # Mountain 1: Left peak
    draw.polygon([
        (m_left, m_bottom),
        (int(size * 0.38), int(size * 0.40)),
        (int(size * 0.55), m_bottom)
    ], fill=(122, 62, 29, 230)) # #7A3E1D Bazan
    
    # Mountain 2: Right / Main peak
    draw.polygon([
        (int(size * 0.36), m_bottom),
        (int(size * 0.62), int(size * 0.34)),
        (m_right, m_bottom)
    ], fill=(168, 69, 36, 240)) # #A84524 Bazan Red
    
    # Mountain highlights (golden snow/ridge)
    draw.line([(int(size * 0.38), int(size * 0.40)), (int(size * 0.34), m_bottom)], fill=(243, 197, 98, 200), width=max(2, int(size * 0.015)))
    draw.line([(int(size * 0.62), int(size * 0.34)), (int(size * 0.58), m_bottom)], fill=(255, 230, 150, 240), width=max(2, int(size * 0.02)))

    # Stylized Coffee Bean at center-bottom
    bean_w = int(size * 0.28)
    bean_h = int(size * 0.18)
    bx, by = cx, int(size * 0.68)
    # Bean shape
    draw.ellipse([bx - bean_w//2, by - bean_h//2, bx + bean_w//2, by + bean_h//2], fill=(59, 36, 23, 255), outline=(213, 163, 63, 255), width=max(2, int(size * 0.02)))
    # S-curve inside coffee bean
    points = []
    for t in range(-bean_w//2 + int(size*0.03), bean_w//2 - int(size*0.03), max(1, size//100)):
        norm = t / (bean_w // 2)
        y_offset = math.sin(norm * math.pi) * (bean_h * 0.25)
        points.append((bx + t, by + int(y_offset)))
    if len(points) > 1:
        draw.line(points, fill=(243, 197, 98, 255), width=max(2, int(size * 0.022)))

    # Typography Monogram: DL in Gong Gold and Pure White at bottom
    # Load font or draw clean geometric text
    try:
        font_path = "C:/Windows/Fonts/segoeuib.ttf"
        font_size = int(size * 0.18)
        font = ImageFont.truetype(font_path, font_size)
    except:
        font = ImageFont.load_default()
        
    text = "DL"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (size - tw) // 2
    ty = int(size * 0.77)
    
    # Shadow
    draw.text((tx + 2, ty + 2), text, font=font, fill=(0, 0, 0, 200))
    # Text in Gong Gold
    draw.text((tx, ty), text, font=font, fill=(243, 197, 98, 255))
    
    return img

def create_horizontal_logo(w=720, h=180, dark_theme=True):
    img = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Left icon
    icon_size = int(h * 0.82)
    icon = create_brand_icon(icon_size)
    icon_x = int(h * 0.15)
    icon_y = (h - icon_size) // 2
    img.paste(icon, (icon_x, icon_y), icon)
    
    # Typography
    text_x = icon_x + icon_size + int(h * 0.15)
    
    try:
        font_main = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", int(h * 0.36))
        font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", int(h * 0.13))
    except:
        font_main = font_sub = ImageFont.load_default()
        
    # Main Brand Text: "DakLak" + ".today"
    main_y = int(h * 0.22)
    word1 = "DakLak"
    word2 = ".today"
    
    w1_color = (255, 255, 255, 255) if dark_theme else (59, 36, 23, 255)
    w2_color = (213, 163, 63, 255) # #D5A33F Gong Gold
    
    draw.text((text_x, main_y), word1, font=font_main, fill=w1_color)
    bbox1 = draw.textbbox((text_x, main_y), word1, font=font_main)
    w1_end = bbox1[2]
    draw.text((w1_end, main_y), word2, font=font_main, fill=w2_color)
    
    # Subtitle: CỔNG THÔNG TIN • DỮ LIỆU • ĐẦU TƯ ĐẮK LẮK
    sub_y = int(h * 0.65)
    sub_text = "CỔNG THÔNG TIN • DỮ LIỆU & ĐẦU TƯ ĐẮK LẮK"
    sub_color = (213, 163, 63, 220) if dark_theme else (122, 62, 29, 220)
    draw.text((text_x, sub_y), sub_text, font=font_sub, fill=sub_color)
    
    return img

if __name__ == '__main__':
    # Icon 512
    icon512 = create_brand_icon(512)
    icon192 = icon512.resize((192, 192), Image.Resampling.LANCZOS)
    icon64 = icon512.resize((64, 64), Image.Resampling.LANCZOS)
    icon32 = icon512.resize((32, 32), Image.Resampling.LANCZOS)
    
    logo_dark = create_horizontal_logo(720, 180, dark_theme=True)
    logo_light = create_horizontal_logo(720, 180, dark_theme=False)
    
    out_dirs = ['public', 'frontend/public']
    for d in out_dirs:
        os.makedirs(d, exist_ok=True)
        icon512.save(os.path.join(d, 'logo_icon.png'), 'PNG')
        icon512.save(os.path.join(d, 'pwa-512x512.png'), 'PNG')
        icon192.save(os.path.join(d, 'pwa-192x192.png'), 'PNG')
        icon64.save(os.path.join(d, 'favicon.png'), 'PNG')
        icon32.save(os.path.join(d, 'favicon-32x32.png'), 'PNG')
        icon32.save(os.path.join(d, 'favicon.ico'), 'ICO')
        logo_dark.save(os.path.join(d, 'logo_doanhnghiepvn_dark.png'), 'PNG')
        logo_light.save(os.path.join(d, 'logo_doanhnghiepvn.png'), 'PNG')
        logo_dark.save(os.path.join(d, 'logo_daklak_dark.png'), 'PNG')
        logo_light.save(os.path.join(d, 'logo_daklak.png'), 'PNG')
        
    print("ALL LOGOS GENERATED SUCCESSFULLY!")
