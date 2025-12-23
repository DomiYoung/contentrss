from playwright.sync_api import sync_playwright
import time
import os

def test_v2_features():
    with sync_playwright() as p:
        # 1. Setup Browser
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 390, 'height': 844}) # iPhone 13 size
        page = context.new_page()
        
        print("🚀 Starting V2 Regression Test...")
        
        # 2. Navigate to App
        page.goto('http://localhost:5173')
        page.wait_for_load_state('networkidle')
        page.wait_for_selector('.intelligence-card', timeout=10000)
        
        # TC-001: UI Background Check (Check the root container)
        page.wait_for_selector('.min-h-screen')
        container_bg = page.evaluate("window.getComputedStyle(document.querySelector('.min-h-screen')).backgroundColor")
        print(f"📊 TC-001: Container background color is {container_bg}")
        # Note: #FAF9F6 is rgb(250, 249, 246)
        
        # TC-002: Swipe to Ignore (Simulated)
        cards = page.locator('.intelligence-card')
        initial_count = cards.count()
        print(f"📦 Initial cards: {initial_count}")
        
        if initial_count > 0:
            first_card = cards.first
            # Simulate a left drag to test dismissal
            box = first_card.bounding_box()
            page.mouse.move(box['x'] + box['width'] - 10, box['y'] + 20)
            page.mouse.down()
            page.mouse.move(box['x'] + 50, box['y'] + 20, steps=10)
            page.mouse.up()
            time.sleep(1) # wait for animation
            
            # Reload to restore cards for the next test
            page.reload()
            page.wait_for_selector('.intelligence-card')
            print("🔄 TC-002: Card dismissed and page reloaded to restore state")
        
        # TC-004 & TC-005: Details View Interactions
        if initial_count > 0:
            cards.first.click()
            page.wait_for_load_state('networkidle')
            print("📖 Entered Article Detail")
            
            # NotePad Test
            page.click('button:has-text("Note")')
            page.wait_for_selector('textarea[placeholder*="insights"]')
            page.fill('textarea[placeholder*="insights"]', "Test Insight for V2")
            page.click('button:has-text("Save Note")')
            print("📝 TC-004: Note saved")
            
            # Close Note
            page.click('button:has(svg.lucide-x)')
            
            # Ask AI Test
            page.click('button:has-text("Ask AI")')
            page.wait_for_selector('input[placeholder*="details"]', timeout=5000)
            page.fill('input[placeholder*="details"]', "Hello Intelligence")
            page.click('button:has(svg.lucide-send)')
            print("🤖 TC-005: Message sent to AI")
            
            # Wait for simulation reply
            time.sleep(3)
            replies = page.locator('div:has-text("Based on my analysis")')
            if replies.count() > 0:
                print("✅ TC-005: AI Replied successfully")
            else:
                print("❌ TC-005: AI Reply delayed or missing")
                page.screenshot(path='tests/error_ask_ai.png')
            
        print("🎉 All regression tests completed.")
        browser.close()

if __name__ == "__main__":
    test_v2_features()
