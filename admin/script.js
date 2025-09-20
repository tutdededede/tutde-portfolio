document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const contentSections = document.querySelectorAll('.content-section');
    const addItemBtn = document.getElementById('add-item-btn');
    const itemBody = document.getElementById('invoice-item-body');
    const taxRateInput = document.getElementById('tax-rate');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const clientNameInput = document.getElementById('client-name-input');
    const clientSignatureName = document.getElementById('client-signature-name');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            navLinks.forEach(item => item.parentElement.classList.remove('active'));
            this.parentElement.classList.add('active');
            const targetId = this.getAttribute('data-target');
            contentSections.forEach(section => {
                section.id === targetId ? section.classList.remove('hidden') : section.classList.add('hidden');
            });
        });
    });

    function calculateTotals() {
        let subtotal = 0;
        itemBody.querySelectorAll('tr').forEach(row => {
            const quantity = parseFloat(row.querySelector('.quantity').value) || 0;
            const unitPrice = parseFloat(row.querySelector('.unit-price').value) || 0;
            const total = quantity * unitPrice;
            row.querySelector('.line-total').textContent = formatCurrency(total);
            subtotal += total;
        });

        const taxRate = parseFloat(taxRateInput.value) || 0;
        const taxAmount = subtotal * (taxRate / 100);
        const grandTotal = subtotal + taxAmount;

        document.getElementById('subtotal').textContent = formatCurrency(subtotal);
        document.getElementById('tax-amount').textContent = formatCurrency(taxAmount);
        document.getElementById('grand-total').textContent = formatCurrency(grandTotal);
    }

    function formatCurrency(value) {
        return 'Rp ' + value.toLocaleString('id-ID');
    }

    function createItemRow() {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="text" placeholder="Deskripsi item" class="editable item-description"></td>
            <td><input type="number" placeholder="1" class="editable quantity"></td>
            <td><input type="number" placeholder="0" class="editable unit-price"></td>
            <td class="line-total">${formatCurrency(0)}</td>
            <td class="action-cell"><button class="btn-delete-item"><i class="fas fa-trash-alt"></i></button></td>
        `;
        itemBody.appendChild(row);
    }
    
    function generateInvoiceDetails() {
        const now = new Date();
        const year = now.getFullYear();
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
        document.getElementById('invoice-number').value = `TD-${randomNum}-${year}`;
        document.getElementById('invoice-date').valueAsDate = now;
    }

    function updateClientSignature() {
        clientSignatureName.value = clientNameInput.value;
    }

    addItemBtn.addEventListener('click', createItemRow);
    itemBody.addEventListener('click', function(e) {
        if (e.target.closest('.btn-delete-item')) {
            e.target.closest('tr').remove();
            calculateTotals();
        }
    });

    itemBody.addEventListener('input', calculateTotals);
    taxRateInput.addEventListener('input', calculateTotals);
    clientNameInput.addEventListener('input', updateClientSignature);

    downloadPdfBtn.addEventListener('click', () => {
        const invoiceToPrint = document.getElementById('invoice-to-print');
        const invoiceNumber = document.getElementById('invoice-number').value || 'invoice';
        invoiceToPrint.classList.add('printing');

        html2canvas(invoiceToPrint, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${invoiceNumber}.pdf`);
            
            invoiceToPrint.classList.remove('printing');
        });
    });

    createItemRow();
    calculateTotals();
    generateInvoiceDetails();
});