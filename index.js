const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const port = 3001;
const apiUrlBase = "https://dhirajsakore.myshopify.com/admin/api/2025-01/products.json";
const accessToken = "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";


app.use(express.json({ limit: '50mb' })); // Allow JSON body up to 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Allow URL-encoded body u
// Middleware to parse JSON body
app.use(cors());
app.use(express.json());

// GET products (same as before)
app.get('/proxy/products', async (req, res) => {
  try {
    const response = await fetch(apiUrlBase, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});


app.get('/proxy/product/:id', async (req, res) => {
    const productId = req.params.id; // Get product ID from the URL params
    
    
  
    try {
      const response = await fetch(`${apiUrlBase}?ids=${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
      });
    
      
  
      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }
  
      const data = await response.json();
      res.json(data); // Respond with the product data
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });
  

// CREATE product
app.post('/proxy/products', async (req, res) => {
  const newProduct = req.body.product; // Expecting the product data in the request body
  
  try {
    const response = await fetch(apiUrlBase, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        product: newProduct
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.statusText}`);
    }

    const data = await response.json();
    res.status(201).json(data); // Respond with the created product data
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
   
    
  }
});

// UPDATE product
app.patch('/proxy/products/:id', async (req, res) => {
    const productId = req.params.id; // Get the product ID from URL params
    const updatedProduct = req.body.product; // Get the updated product data from the request body

    const updatedData = {
        id: productId, // Use the product ID from URL params
        title: updatedProduct.title, // Use the title from the updatedProduct object
        body_html: updatedProduct.body_html, // Use the description from the updatedProduct object
        vendor: updatedProduct.vendor, // Use the vendor from the updatedProduct object
        variants: updatedProduct.variants.map(variant => ({
            id: variant.id, // Use the variant ID (if updating variants)
            price: variant.price, // Use the updated price
            sku: variant.sku, // Optionally, update SKU
        })),
    };

    // Only add the images field if there are images in the updatedProduct object
    if (updatedProduct?.updateimg) {
        updatedData.images = updatedProduct.images
    }

    try {
        const response = await fetch(`https://dhirajsakore.myshopify.com/admin/api/2025-01/products/${productId}.json`, {
            method: 'PATCH', // Use PATCH to update only specific fields
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Access-Token': accessToken,
            },
            body: JSON.stringify({
                product: updatedData, // Send only the updated fields
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to update product: ${response.statusText}`);
        }

        const data = await response.json();
     

        res.json(data); // Respond with the updated product data
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

  
  

// DELETE product
app.delete('/proxy/products/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const response = await fetch(`https://dhirajsakore.myshopify.com/admin/api/2025-01/products/${productId}.json`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.statusText}`);
    }

    const data = await response.json();
    res.json({ message: 'Product deleted successfully', data }); // Respond with success message
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});
