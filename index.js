import { companies, roles } from "./static-data.js";

(function () {
    let resumeBtn = document.getElementById('resume');
    let addRecordBtn = document.getElementById('add-record');
    let exportTableBtn = document.getElementById('export-btn');
    let accountBtn = document.getElementById('account-btn');
    let table = document.getElementById('applications-table');

    let applications = [];
    let resumes = [];

    function loadApplications() {
        if (!getFromLocalStorage('applications') || getFromLocalStorage('applications').length === 0) {
            applications = [];
            table.querySelector('tbody').childNodes.forEach(function (c) {
                table.querySelector('tbody').removeChild(c);
            });
        } else {
            applications = getFromLocalStorage('applications');

            for (let i = 0; i < applications.length; i++) {
                let newRowEl = document.createElement('tr');
                let seqNoEl = document.createElement('th');
                seqNoEl.setAttribute('scope', 'row');
                seqNoEl.innerText = i+1;
                newRowEl.appendChild(seqNoEl);
                for (const key in applications[i]) {
                    if (["company", "position", "date", "link"].indexOf(key) >= 0) {
                        let cell = document.createElement('td');
                        cell.innerText = applications[i][key];
                        newRowEl.appendChild(cell);
                    }
                }
                table.querySelector('tbody').appendChild(newRowEl);
            }

            table.querySelector('tbody').querySelectorAll('tr').forEach(row => {
                row.addEventListener('click', function (event) {
                    console.log(row);
                    console.log(event.target);
                    // open slideover
                });
            });
        }
    }

    loadApplications();

    /** upload, view, remove resume */
    resumeBtn.addEventListener('click', function (event) {
        // get all resumes
        function loadUploadedResumes() {
            let listEl = document.getElementById('resumes-list');
            if (!getFromLocalStorage('resumes') || getFromLocalStorage('resumes').length === 0) {
                resumes = [];
                listEl.childNodes.forEach(function (c) {
                    listEl.removeChild(c);
                });
            } else {
                resumes = getFromLocalStorage('resumes');
            }
            resumes.forEach(function (r) {
                if (!document.getElementById(r.id)) {
                    let listItem = document.createElement('li');
                    listItem.id = r.id;
                    listItem.classList.add('list-group-item');
                    // file
                    let filenameEl = document.createElement('span');
                    filenameEl.classList.add('clickable');
                    filenameEl.classList.add('custom-link');
                    filenameEl.innerText = r.filename;
                    filenameEl.setAttribute('data-id', r.id);
                    // view resume
                    filenameEl.addEventListener('click', function (resumeViewEvent) {
                        let selectedResumeId = resumeViewEvent.target.getAttribute('data-id');
                        let selectedResume = resumes.filter(function (resume) {
                            return resume.id === selectedResumeId
                        });
                        if (selectedResume.length > 0) {
                            console.log(selectedResume[0]);
                            // create object url
                            let tempUrl = blobToURL(dataURItoBlob(selectedResume[0].dataUrl));
                            let tempLink = document.createElement('a');
                            tempLink.href = tempUrl;
                            tempLink.target = '_blank';
                            tempLink.click();
                        }
                    });
                    // delete file btn
                    let removeBtn = document.createElement('button');
                    removeBtn.classList.add('btn-close');
                    removeBtn.id = `remove-${r.id}`;
                    removeBtn.setAttribute('data-id', r.id);
                    // remove resume
                    removeBtn.addEventListener('click', function (removeResumeEvent) {
                        console.log('here');
                        let selectedResumeId = removeResumeEvent.target.getAttribute('data-id');
                        let selectedResume = resumes.filter(function (resume) {
                            return resume.id === selectedResumeId
                        });
                        if (selectedResume.length > 0) {
                            resumes = resumes.filter(function (resume) {
                                return resume.id !== selectedResumeId
                            });
                            saveToLocalStorage('resumes', resumes);
                            loadUploadedResumes();
                        }
                    });
                    // append to li
                    listItem.appendChild(filenameEl);
                    listItem.appendChild(removeBtn);
                    listEl.appendChild(listItem);
                }
            });
        }
        // upload new resume
        let fileInput = document.getElementById('resumeUpload');
        fileInput.addEventListener('change', function (fileSelectEvent) {
            console.log(fileSelectEvent.target.files);
            fileSelectEvent.target.files[0]
                .arrayBuffer()
                .then(function (arrayBuffer) {
                    var fr = new FileReader();
                    fr.onload = function (e) {
                        let resumeObj = {};
                        resumeObj['id'] = uuidv4();
                        resumeObj['filename'] = fileSelectEvent.target.files[0].name;
                        resumeObj['dataUrl'] = e.target.result;
                        resumeObj['uploadDate'] = new Date();
                        console.log(resumeObj);
                        resumes.push(resumeObj);
                        saveToLocalStorage('resumes', resumes);
                        fileInput.value = null;
                        loadUploadedResumes();
                    }
                    fr.readAsDataURL(fileSelectEvent.target.files[0]);
                });
        });
        // initially load uploaded resumes
        loadUploadedResumes();
    });

    /** save new application */
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
            let newApplication = {};
            let newRowEl = document.createElement('tr');
            let seqNoEl = document.createElement('th');
            seqNoEl.setAttribute('scope', 'row');
            seqNoEl.innerText = applications.length + 1;
            newRowEl.appendChild(seqNoEl);
            form.querySelectorAll('input').forEach(function (ctrl) {
                console.log(ctrl.value);
                newApplication[ctrl.name] = ctrl.value;
                if (["company", "position", "date", "link"].indexOf(ctrl.name) >= 0) {
                    let cell = document.createElement('td');
                    cell.innerText = ctrl.value;
                    newRowEl.appendChild(cell);
                }
            });
            applications.push(newApplication);
            saveToLocalStorage('applications', applications);
            table.querySelector('tbody').appendChild(newRowEl);
            document.getElementById('close-application-modal-btn').click();
        });
    });

    /** TODO */
    exportTableBtn.addEventListener('click', function (event) {
        console.log('export table btn');
    });

    /** TODO */
    accountBtn.addEventListener('click', function (event) {
        console.log('account btn');
    });
})()

/** helpers */
function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromLocalStorage(key) {
    let data = localStorage.getItem(key)
    return JSON.parse(data);
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function blobToURL(blob) {
    return URL.createObjectURL(blob);
}

function dataURItoBlob(dataURI) {
    var mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for (var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: mime });
}