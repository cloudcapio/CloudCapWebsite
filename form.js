document.getElementById('contactForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
  
    try {
      const response = await fetch('YOUR_SERVERLESS_FUNCTION_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        alert('Thank you for your message! We\'ll get back to you soon.');
        event.target.reset();
      } else {
        alert('Oops! Something went wrong. Please try again later.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Oops! Something went wrong. Please try again later.');
    }
  });