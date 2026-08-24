(function () {
    "use strict"

    // Sample Data
    const productsData = [
        ['SPK001', 'Running Shoes', '../assets/images/ecommerce/png/6.png', '$699.99', 'In Stock', 'Published', '120', 'Mar 12, 2025', 'footwear'],
        ['SPK002', 'Summer Dress', '../assets/images/ecommerce/png/2.png', '$89.99', 'Out of Stock', 'Draft', '0', 'Mar 10, 2025', 'fashion'],
        ['SPK003', 'Portable Camera', '../assets/images/ecommerce/png/12.png', '$399.99', 'In Stock', 'Published', '45', 'Mar 5, 2025', 'electronics'],
        ['SPK004', 'Wooden Sofa Chair', '../assets/images/ecommerce/png/15.png', '$129.99', 'In Stock', 'Published', '250', 'Mar 2, 2025', 'home'],
        ['SPK005', 'Alarm Clock', '../assets/images/ecommerce/png/5.png', '$199.99', 'In Stock', 'Archived', '75', 'Feb 28, 2025', 'home'],
        ['SPK006', 'Samsung Headset', '../assets/images/ecommerce/png/7.png', '$149.99', 'Out of Stock', 'Draft', '0', 'Feb 25, 2025', 'electronics'],
        ['SPK007', 'Ladies Bag', '../assets/images/ecommerce/png/8.png', '$79.99', 'In Stock', 'Published', '300', 'Feb 20, 2025', 'fashion'],
        ['SPK008', 'Galaxy Mobile', '../assets/images/ecommerce/png/9.png', '$59.99', 'In Stock', 'Published', '150', 'Feb 18, 2025', 'electronics'],
        ['SPK009', 'Elegant Watch', '../assets/images/ecommerce/png/10.png', '$59.99', 'In Stock', 'Published', '60', 'Feb 15, 2025', 'home'],
        ['SPK010', 'Office Classic Bag', '../assets/images/ecommerce/png/16.png', '$39.99', 'Out of Stock', 'Archived', '0', 'Feb 10, 2025', 'fashion']
    ];

    const grid = new gridjs.Grid({
        columns: [
            {
                name: '#',
                formatter: (_, row) => gridjs.html(
                    `<input class="form-check-input" type="checkbox" id="product-${row.cells[0].data}" value="" aria-label="...">`
                )
            },
            {
                name: 'Product ID',
                formatter: (_, row) => gridjs.html(
                    `<a href="javascript:void(0);">${row.cells[0].data}</a>`  // Correctly map to Product ID (row[0])
                )
            },
            {
                name: 'Product Name',
                formatter: (_, row) => gridjs.html(
                    `<a href="product-details.html">
                        <div class="flex items-center gap-4 relative">
                            <div class="leading-none">
                                <span class="avatar avatar-lg bg-light p-1">
                                    <img src="${row.cells[2].data}" alt="Product Image">
                                </span>
                            </div>
                            <div>
                                <span class="block font-semibold text-dark">${row.cells[1].data}</span>
                                <span class="text-textmuted text-[13px]">${row.cells[8].data}</span>
                            </div>
                        </div>
                    </a>`
                )
            },
            {
                name: 'Price',
                formatter: (_, row) => gridjs.html(
                    `${row.cells[3].data}` // Correctly map to Quantity (row[6])
                )
            },
            {
                name: 'Stock Status',
                formatter: (_, row) => gridjs.html(
                    `<span class="badge bg-${row.cells[4].data === 'In Stock' ? 'success' : 'danger'}-transparent">${row.cells[4].data}</span>`
                )
            },
            {
                name: 'Quantity',
                formatter: (_, row) => gridjs.html(
                    `${row.cells[6].data}` // Correctly map to Quantity (row[6])
                )
            },
            {
                name: 'Status',
                formatter: (_, row) => gridjs.html(
                    `<span class="text-${row.cells[5].data === 'Published' ? 'primary' : row.cells[5].data === 'Archived' ? 'success' : 'danger'}">${row.cells[5].data}</span>`
                )
            },
            {
                name: 'Date Added',
                formatter: (_, row) => gridjs.html(
                    `${row.cells[7].data}` // Correctly map to Quantity (row[6])
                )
            },
            {
                name: 'Actions',
                formatter: (_, row) => gridjs.html(`
                    <div class="text-center">
                        <div class="ti-dropdown hs-dropdown ti-custom-drop relative inline-block">
                            <a href="javascript:void(0);" class="ti-custom-btn ti-btn-icon ti-btn-sm ti-btn-primary-light border border-defaultborder rounded-sm bg-primary-transparent relative!" data-bs-toggle="ti-dropdown" aria-expanded="false">
                                <i class="fe fe-more-vertical"></i>
                            </a>
                            <ul class="ti-dropdown-menu hs-dropdown-menu ti-custom-menu hidden mt-0 custom-product-drop">
                                <li><a class="ti-dropdown-item inline-flex items-center" href="orders-details.html"><i class="ri-eye-line me-2 leading-none"></i>View</a></li>
                                <li><a class="ti-dropdown-item inline-flex items-center btn-delete" href="javascript:void(0);"><i class="ri-delete-bin-line me-2 leading-none"></i>Delete</a></li>
                            </ul>
                        </div>
                    </div>
                `)
            }
        ],
        data: productsData,
        pagination: true,
        search: false,
        sort: true
    }).render(document.getElementById('product-table'));

    // Filter functionality: event listeners for input and filter dropdowns
    document.getElementById('search-input').addEventListener('input', (e) => applyFilters());
    document.getElementById('category-filter').addEventListener('change', (e) => applyFilters());
    document.getElementById('status-filter').addEventListener('change', (e) => applyFilters());
    document.getElementById('stock-filter').addEventListener('change', (e) => applyFilters());
    document.getElementById('sort-filter').addEventListener('change', (e) => applyFilters());

    // Function to apply search and filter logic
    function applyFilters() {
        const searchInput = document.getElementById('search-input').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        const stockFilter = document.getElementById('stock-filter').value;
        const sortFilter = document.getElementById('sort-filter').value;

        const filteredData = productsData.filter(row => {
            const productName = row[1].toLowerCase();
            const category = row[8].toLowerCase();
            const status = row[5].toLowerCase();
            const stock = row[4].toLowerCase();

            let formattedStock = "";
            if (row[4] === "In Stock") {
                formattedStock = "in-stock";
            } else if (row[4] === "Out of Stock") {
                formattedStock = "out-of-stock";
            }

            const searchCondition = productName.includes(searchInput);
            const categoryCondition = categoryFilter === '' || categoryFilter === 'all' || category === categoryFilter;
            const statusCondition = statusFilter === '' || statusFilter === 'all' || status === statusFilter;
            const stockCondition = stockFilter === '' || stockFilter === 'all' || formattedStock === stockFilter;
            return searchCondition && categoryCondition && statusCondition && stockCondition;
        });

        if (sortFilter) {
            if (sortFilter === 'date') {
                filteredData.sort((a, b) => new Date(b[7]) - new Date(a[7]));
            } else if (sortFilter === 'price') {
                filteredData.sort((a, b) => parseFloat(b[3].replace('$', '')) - parseFloat(a[3].replace('$', '')));
            } else if (sortFilter === 'name') {
                filteredData.sort((a, b) => a[1].localeCompare(b[1]));
            }
        }

        grid.updateConfig({
            data: filteredData
        }).forceRender();

        // Handle the display of the "No matches found" row
        const gridContainer = document.getElementById('product-table');
        const tableBody = gridContainer.querySelector('.gridjs-tbody');

        // Clear previous "No matches found" row
        const notFoundElement = document.querySelector('.gridjs-notfound');
        if (notFoundElement) {
            notFoundElement.style.display = 'none';  // Hide it using JavaScript
        }

        const noMatchesRow = document.getElementById('no-matches-row');
        if (noMatchesRow) {
            noMatchesRow.remove();
        }

        // If no results after filtering, create and append a "No matches found" row
        if (filteredData.length === 0) {
            const tr = document.createElement('tr');
            tr.id = 'no-matches-row';
            // Create a single cell spanning all columns
            const td = document.createElement('td');
            td.colSpan = 9; // Adjust the colspan to match the number of columns
            td.style.textAlign = 'center';
            td.textContent = 'No matching records found';
            td.style.fontWeight = '500';
            td.style.color = 'var(--default-text-color)';
            td.style.padding = '12px';
            tr.appendChild(td);
            tableBody.appendChild(tr);
        }
    }

    // Add a listener for delete actions in the table with SweetAlert confirmation
    // document.addEventListener('click', function (e) {
   // Add a listener for delete actions in the table with SweetAlert confirmation
    document.addEventListener('click', function (e) {
        // Find the nearest element with .btn-delete (works for clicks on the icon too)
        const deleteBtn = e.target.closest('.btn-delete');
        if (!deleteBtn) return; // click wasn't on delete button or its children

        e.preventDefault(); // avoid any default link behavior

        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                // Find the row from the button
                const rowEl = deleteBtn.closest('tr');
                if (!rowEl) return;

                const rowIndex = rowEl.rowIndex - 1; // Subtract 1 for header row

                // Remove the product from the productsData array
                if (rowIndex >= 0 && rowIndex < productsData.length) {
                    productsData.splice(rowIndex, 1);
                }

                // Update the grid with the new data
                grid.updateConfig({
                    data: productsData
                }).forceRender();

                Swal.fire(
                    'Deleted!',
                    'Your product has been deleted.',
                    'success'
                );
            }
        });
    });
    document.addEventListener('click', function (e) {
        const clickedBtn = e.target.closest('.ti-custom-btn'); 
        const allMenus = document.querySelectorAll('.ti-custom-menu'); 

        if (clickedBtn) {
            const dropdown = e.target.closest('.ti-custom-drop');
            const currentMenu = dropdown.querySelector('.ti-custom-menu');

            
            allMenus.forEach(menu => {
            if (menu !== currentMenu) {
                menu.classList.add('hidden');
            }
            });

            
            currentMenu.classList.toggle('hidden');
        } else {
            
            allMenus.forEach(menu => menu.classList.add('hidden'));
        }
    });
})();