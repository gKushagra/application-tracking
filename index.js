import { companies, roles } from "./static-data.js";

(function () {
    let addRecordBtn = document.getElementById('add-record');
    let exportTableBtn = document.getElementById('export-btn');
    let accountBtn = document.getElementById('account-btn');
    let table = document.getElementById('applications-table');

    let applications = [];

    addRecordBtn.addEventListener('click', function (event) {
        // initialize datepicker
        let date_input = $('input[name="date"]'); //our date input has the name "date"
        let options = {
            format: 'mm/dd/yyyy',
            todayHighlight: true,
            autoclose: true,
            orientation: 'top right'
        };
        date_input.datepicker(options);
        // initialize company search
        let companyInput = document.getElementById('companiesListInput');
        companyInput.addEventListener('input', function (companyInputEvent) {
            let filteredCompanies = companies.filter(c => {
                return c["Company Name"].toLowerCase().indexOf(companyInput.value.toLowerCase()) >= 0
            });
            filteredCompanies = filteredCompanies.slice(0, 25);
            // console.log(filteredCompanies);
            let dataList = document.getElementById('companiesList');
            dataList.childNodes.forEach(c => {
                dataList.removeChild(c);
            });
            filteredCompanies.forEach(c => {
                let optionEl = document.createElement('option');
                optionEl.value = c["Company Name"];
                dataList.appendChild(optionEl);
            });
        });
        // initialize role search
        let roleInput = document.getElementById('rolesListInput');
        roleInput.addEventListener('input', function (roleInputEvent) {
            let filteredRoles = roles.filter(r => {
                return r.toLowerCase().indexOf(roleInput.value.toLowerCase()) >= 0
            });
            filteredRoles = filteredRoles.slice(0, 25);
            // console.log(filteredRoles);
            let dataList = document.getElementById('rolesList');
            dataList.childNodes.forEach(c => {
                dataList.removeChild(c);
            });
            filteredRoles.forEach(r => {
                let optionEl = document.createElement('option');
                optionEl.value = r;
                dataList.appendChild(optionEl);
            });
        });
        // initilize save button
        let saveBtn = document.getElementById('save');
        saveBtn.addEventListener('click', function (event1) {
            let form = document.getElementById('new-application');
            let newApplication = Object.create();
            let newRowEl = document.createElement('tr');
            let seqNoEl = document.createElement('th');
            seqNoEl.setAttribute('scope', 'row');
            seqNoEl.innerText = applications.length;
            newRowEl.appendChild(seqNoEl);
            form.querySelectorAll('input').forEach(function (ctrl) {
                console.log(ctrl.value);
                newApplication[ctrl.name] = ctrl.value;
                if (["company", "position", "date", "link"].indexOf(ctrl.name)) {
                    let cell = document.createElement('td');
                    cell.innerText = ctrl.value;
                    newRowEl.appendChild(cell);
                }
            });
            table.querySelector('tbody').appendChild(newRowEl);
        });
    });

    exportTableBtn.addEventListener('click', function (event) {
        console.log('export table btn');
    });

    accountBtn.addEventListener('click', function (event) {
        console.log('account btn');
    });

    table.querySelector('tbody').querySelectorAll('tr').forEach(row => {
        row.addEventListener('click', function (event) {
            console.log(row);
            console.log(event.target);
        });
    });
})()