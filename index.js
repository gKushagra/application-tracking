import { companies, roles } from "./static-data.js";

(function () {
    let resumeBtn = document.getElementById('resume');
    let addRecordBtn = document.getElementById('add-record');
    let exportTableBtn = document.getElementById('export-btn');
    // let accountBtn = document.getElementById('account-btn');
    let table = document.getElementById('applications-table');
    let offCanvasEl = document.getElementById('viewRecord');
    let offCanvas = new bootstrap.Offcanvas(offCanvasEl);

    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });

    let applications = [];
    let resumes = [];

    function loadApplications() {
        if (!getFromLocalStorage('applications') ||
            getFromLocalStorage('applications').length === 0) {
            applications = [];
            table.querySelector('tbody').childNodes.forEach(function (c) {
                table.querySelector('tbody').removeChild(c);
            });
        } else {
            applications = getFromLocalStorage('applications');

            for (let i = 0; i < applications.length; i++) {
                let newRowEl = document.createElement('tr');
                newRowEl.setAttribute('data-app-id', applications[i].id);
                let seqNoEl = document.createElement('th');
                seqNoEl.setAttribute('scope', 'row');
                seqNoEl.innerText = i + 1;
                newRowEl.appendChild(seqNoEl);
                for (const key in applications[i]) {
                    if (["company", "status", "date", "link"].indexOf(key) >= 0) {
                        let cell = document.createElement('td');
                        if (key === 'link') {
                            let linkEl = document.createElement('a');
                            if (!applications[i][key].includes('http://')) {
                                linkEl.href = 'http://' + applications[i][key];
                            } else {
                                linkEl.href = applications[i][key];
                            }
                            linkEl.target = '_blank';
                            linkEl.innerText = applications[i][key];
                            linkEl.addEventListener('click', function (linkClickEv) {
                                linkClickEv.stopPropagation();
                            });
                            cell.appendChild(linkEl);
                        } else {
                            cell.innerText = applications[i][key];
                        }
                        newRowEl.appendChild(cell);
                    }
                }
                table.querySelector('tbody').appendChild(newRowEl);
            }

            table.querySelector('tbody').querySelectorAll('tr').forEach(row => {
                row.addEventListener('click', function (event) {
                    // open slideover
                    offCanvas.toggle();
                    // initialize datepicker, companies and roles search
                    commonComponentsInit(
                        'date-offcanvas',
                        'companiesListInput-offcanvas',
                        'rolesListInput-offcanvas'
                    );
                    // get form
                    let editForm = document.getElementById('edit-application');
                    // get current application
                    let currentApplication = applications.filter(function (app) {
                        return app.id === row.getAttribute('data-app-id');
                    });
                    if (currentApplication.length > 0) {
                        // patch data
                        modifyForm(true);
                        controlsVisibility(false);
                        // add listener to edit button
                        let editAppBtn = document.getElementById('edit-application-btn');
                        let saveChangesBtn = document.getElementById('edit-application-save-btn');
                        let discardChangesBtn = document.getElementById('edit-application-cancel-btn');
                        toggleButtons(false);
                        editAppBtn.addEventListener('click', function (editAppEv) {
                            controlsVisibility(false);
                            toggleButtons(true);
                            discardChangesBtn.addEventListener('click', function (discardChangesEv) {
                                controlsVisibility(true);
                                toggleButtons(false);
                            });
                            saveChangesBtn.addEventListener('click', function (saveChangesEv) {
                                controlsVisibility(true);
                                toggleButtons(false);
                                modifyForm(false);
                                // console.log(currentApplication[0]);
                                saveToLocalStorage('applications', applications);
                            });
                        });
                        // common method in this scope
                        function toggleButtons(_visible) {
                            editAppBtn.style.visibility = _visible ? 'hidden' : 'visible';
                            saveChangesBtn.style.visibility = _visible ? 'visible' : 'hidden';
                            discardChangesBtn.style.visibility = _visible ? 'visible' : 'hidden';
                        }
                        function controlsVisibility(state) {
                            editForm.querySelectorAll('input').forEach(function (i) {
                                i.readOnly = state;
                            });
                        }
                        function modifyForm(_patch) {
                            editForm.querySelectorAll('input').forEach(function (i) {
                                for (const key in currentApplication[0]) {
                                    if (i.name === key) {
                                        _patch ? i.value = currentApplication[0][key] :
                                            currentApplication[0][key] = i.value
                                    }
                                }
                            });
                        }
                        // handle contacts
                        // handle todos
                    }
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
        // initialize common components
        commonComponentsInit(
            'date',
            'companiesListInput',
            'rolesListInput'
        );
        // initilize save button
        let saveBtn = document.getElementById('save');
        saveBtn.addEventListener('click', function (event1) {
            let form = document.getElementById('new-application');
            let newApplication = {};
            newApplication['id'] = uuidv4();
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
            newApplication['contacts'] = [];
            newApplication['todo'] = [];
            applications.push(newApplication);
            saveToLocalStorage('applications', applications);
            table.querySelector('tbody').appendChild(newRowEl);
            document.getElementById('close-application-modal-btn').click();
        });
    });

    /** datepicker, companies and position selection */
    function commonComponentsInit(dateInputName, companyInputId, rolesInputId) {
        // initialize datepicker
        // let date_input = $('input[name="date"]'); //our date input has the name "date"
        let date_input = $(`input[id='${dateInputName}']`); //our date input has the name "date"
        let options = {
            format: 'mm/dd/yyyy',
            todayHighlight: true,
            autoclose: true,
            orientation: 'top right'
        };
        date_input.datepicker(options);
        // initialize company search
        // let companyInput = document.getElementById('companiesListInput');
        let companyInput = document.getElementById(companyInputId);
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
        // let roleInput = document.getElementById('rolesListInput');
        let roleInput = document.getElementById(rolesInputId);
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
    }

    /** TODO */
    exportTableBtn.addEventListener('click', function (event) {
        console.log('export table btn');
    });

    /** TODO */
    // accountBtn.addEventListener('click', function (event) {
    //     console.log('account btn');
    // });
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