from PIL import Image, ImageDraw

# Create a 200x200 image with blue background
img = Image.new('RGB', (200, 200), color='#3B82F6')
draw = ImageDraw.Draw(img)

# Draw a yellow circle in the center
draw.ellipse([50, 50, 150, 150], fill='#EAB308')

# Save as PNG
img.save('test-logo.png')
print("Test logo created successfully")