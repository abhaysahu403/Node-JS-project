document.addEventListener('DOMContentLoaded', () => {
  const resumeInput = document.getElementById('resume');
  const fileName = document.getElementById('file-name');
  const form = document.getElementById('application-form');
  const status = document.getElementById('form-status');

  resumeInput.addEventListener('change', () => {
    fileName.textContent = resumeInput.files.length ? resumeInput.files[0].name : 'No file selected';
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    status.textContent = 'Submitting your application...';

    const formData = new FormData(form);
    try {
      const response = await fetch('/apply', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        status.textContent = result.message;
        form.reset();
        fileName.textContent = 'No file selected';
      } else {
        status.textContent = result.error || 'Unable to submit application. Please try again.';
      }
    } catch (error) {
      status.textContent = 'Unable to submit application. Please check your network.';
    }
  });
});