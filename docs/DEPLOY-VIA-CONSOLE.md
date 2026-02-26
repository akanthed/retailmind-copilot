# Deploy Lambda Functions via AWS Console (Windows)

Since `zip` command is not available in Git Bash on Windows, we'll deploy via AWS Console.

---

## STEP 1: Deploy Products Lambda

### 1.1 Install Dependencies

```bash
cd backend/functions/products
npm install
```

### 1.2 Create ZIP File (Windows)

**Option A: Using File Explorer**
```
1. Open: backend/functions/products/
2. Select ALL files:
   - index.mjs
   - package.json
   - node_modules (entire folder)
3. Right-click → Send to → Compressed (zipped) folder
4. Name it: function.zip
```

**Option B: Using PowerShell**
```powershell
cd backend/functions/products
Compress-Archive -Path * -DestinationPath function.zip -Force
```

### 1.3 Upload to Lambda

```bash
1. Go to AWS Lambda Console
2. Click "retailmind-products" function
3. Click "Upload from" → ".zip file"
4. Select function.zip
5. Click "Save"
6. Wait for upload (30-60 seconds)
```

### 1.4 Verify Upload

```bash
# In Lambda console, you should see:
- index.mjs
- package.json
- node_modules/ folder
```

---

## STEP 2: Deploy Price Monitor Lambda

### 2.1 Install Dependencies

```bash
cd backend/functions/priceMonitor
npm install
```

### 2.2 Create ZIP File

**Using File Explorer:**
```
1. Open: backend/functions/priceMonitor/
2. Select ALL files (index.mjs, package.json, node_modules)
3. Right-click → Send to → Compressed (zipped) folder
4. Name it: function.zip
```

**Using PowerShell:**
```powershell
cd backend/functions/priceMonitor
Compress-Archive -Path * -DestinationPath function.zip -Force
```

### 2.3 Upload to Lambda

```bash
1. Go to AWS Lambda Console
2. Click "retailmind-price-monitor" function
3. Click "Upload from" → ".zip file"
4. Select function.zip
5. Click "Save"
6. Wait for upload
```

---

## STEP 3: Test Lambda Functions

### 3.1 Test Products Lambda

```bash
# In Lambda console (retailmind-products):
1. Click "Test" tab
2. Create new event: "test-list-products"
3. Event JSON:
```

```json
{
  "httpMethod": "GET",
  "path": "/products",
  "pathParameters": null
}
```

```bash
4. Click "Test"
5. Should see: {"products": [], "count": 0}
```

### 3.2 Test Price Monitor Lambda

```bash
# In Lambda console (retailmind-price-monitor):
1. Click "Test" tab
2. Create new event: "test-monitor"
3. Event JSON: {}
4. Click "Test"
5. Should see: {"message": "No products to monitor", "productsMonitored": 0}
```

---

## ✅ SUCCESS CRITERIA

Both Lambda functions should:
- ✅ Upload successfully (no errors)
- ✅ Show code in editor
- ✅ Test successfully
- ✅ Return expected JSON response

---

## 🚨 TROUBLESHOOTING

### Error: "Deployment package too large"

**Solution:** Make sure you're zipping the CONTENTS, not the folder itself.

**Wrong:**
```
function.zip
└── products/
    ├── index.mjs
    ├── package.json
    └── node_modules/
```

**Correct:**
```
function.zip
├── index.mjs
├── package.json
└── node_modules/
```

### Error: "Cannot find module"

**Solution:** Make sure node_modules is included in the zip.

```bash
# Verify zip contents:
# Extract function.zip and check if node_modules exists
```

### Upload is slow (>5 minutes)

**Normal!** node_modules can be large. Be patient.

---

## 📝 NOTES

- Each function.zip will be ~5-10 MB
- Upload takes 30-60 seconds
- First deployment is slower
- Subsequent updates are faster

---

**Once both functions are deployed, continue to STEP 3 in DAY-2-SETUP-GUIDE.md** 🚀
