import { companies, roles } from "./static-data.js";

(function () {
    let resumeBtn = document.getElementById('resume');
    let addRecordBtn = document.getElementById('add-record');
    let exportTableBtn = document.getElementById('export-btn');
    // let accountBtn = document.getElementById('account-btn');
    // let archivedAppsBtn = document.getElementById('archived-apps'); 
    // let deletedAppsBtn = document.getElementById('deleted-apps');
    let table = document.getElementById('applications-table');
    let offCanvasEl = document.getElementById('viewRecord');
    let offCanvas = new bootstrap.Offcanvas(offCanvasEl);
    let todoTemplateEl = document.getElementById('todo-template');
    let contactTemplateEl = document.getElementById('contact-template');
    todoTemplateEl.hidden = true;
    contactTemplateEl.hidden = true;

    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });

    let applications = [];
    let resumes = [];
    let archived = [];
    let deleted = [];

    function loadApplications() {
        if (!getFromLocalStorage('applications') ||
            getFromLocalStorage('applications').length === 0) {
            applications = [];
            table.querySelector('tbody').childNodes.forEach(function (c) {
                table.querySelector('tbody').removeChild(c);
            });
        } else {
            applications = getFromLocalStorage('applications');
            // show applications
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
                            if (applications[i][key].indexOf('http://') >= 0) {
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
                // row [application] archive and delete actions
                let actionCell = document.createElement('td');
                let deleteBtn = document.createElement('i');
                let archiveBtn = document.createElement('i');
                rowActionBtns([deleteBtn, archiveBtn], ["trash", "archive"]);
                function rowActionBtns(_elArr, _elActions) {
                    for (let j = 0; j < _elArr.length; j++) {
                        _elArr[j].classList.add('bi');
                        _elArr[j].classList.add(`bi-${_elActions[j]}`);
                        _elArr[j].classList.add('clickable');
                        _elArr[j].classList.add('icon-sm');
                        _elArr[j].setAttribute('data-app-id', applications[i].id);
                        _elArr[j].setAttribute('data-toggle', "tooltip");
                        _elArr[j].setAttribute('data-placement', "bottom");
                        _elArr[j].setAttribute('title', `${_elActions[j].toUpperCase()}`);
                    }
                }
                actionCell.appendChild(archiveBtn);
                archiveBtn.addEventListener('click', function (archiveEv) {
                    archiveEv.stopPropagation();
                    transferApplication(archiveEv.target.getAttribute('data-app-id'), "archive");
                });
                actionCell.appendChild(deleteBtn);
                deleteBtn.addEventListener('click', function (delEv) {
                    delEv.stopPropagation();
                    transferApplication(delEv.target.getAttribute('data-app-id'), "delete");
                });
                // common method to archive or delete
                function transferApplication(_id, _action) {
                    let applicationIdx = applications.findIndex(function (app) {
                        return app.id === _id
                    });
                    if (applicationIdx >= 0) {
                        let splicedApplication = applications.splice(applicationIdx, 1)[0];
                        if (!splicedApplication || splicedApplication.length === 0) return;
                        if (_action === "archive") archived.push(splicedApplication);
                        if (_action === "delete") deleted.push(splicedApplication);
                        saveToLocalStorage('applications', applications);
                        saveToLocalStorage('archived', archived);
                        saveToLocalStorage('deleted', deleted);
                        table.querySelector('tbody').childNodes.forEach(function (n) {
                            if (n.getAttribute('data-app-id') === _id) {
                                table.querySelector('tbody').removeChild(n);
                            }
                        });
                    }
                }
                newRowEl.appendChild(actionCell);
                table.querySelector('tbody').appendChild(newRowEl);
            }

            // open offcanvas
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
                        controlsVisibility(true);
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
                        // show contacts
                        let contactsList = document.getElementById('contacts').querySelector('.list-group');
                        currentApplication[0].contacts.forEach(function (contact) {
                            if (!contactsList.querySelector(`[data-contact-id="${contact.id}"]`)) {
                                let newContactEl = createNewContactEl(contact);
                                contactsList.appendChild(newContactEl);
                            }
                        });
                        // add new contact
                        let addContactBtn = document.getElementById('new-contact-btn');
                        addContactBtn.addEventListener('click', function (addContactEv) {
                            addContactEv.stopPropagation();
                            if (!document.getElementById('new-contact-name').value ||
                                document.getElementById('new-contact-name').value === '') return;
                            let newContactObj = {};
                            newContactObj['id'] = uuidv4();
                            newContactObj['name'] = document.getElementById('new-contact-name').value;
                            newContactObj['email'] = document.getElementById('new-contact-email').value;
                            newContactObj['cell'] = document.getElementById('new-contact-cell').value;
                            currentApplication[0].contacts.push(newContactObj);
                            saveToLocalStorage('applications', applications);
                            let newContactEl = createNewContactEl(newContactObj);
                            contactsList.appendChild(newContactEl);
                        });
                        // create new contact el from contact template
                        function createNewContactEl(contact) {
                            let newContactEl = contactTemplateEl.cloneNode(true);
                            newContactEl.hidden = false;
                            newContactEl.id = contact.id;
                            newContactEl.setAttribute('data-app-id', currentApplication[0].id);
                            newContactEl.setAttribute('data-contact-id', contact.id);
                            newContactEl.querySelector('h5').innerText = contact.name;
                            newContactEl.querySelector('p').innerText = contact.email;
                            newContactEl.querySelector('.cell').innerText = contact.cell;
                            newContactEl.querySelector('.btn-close').addEventListener('click', function (delContactEv) {
                                currentApplication[0].contacts = currentApplication[0].contacts.filter(function (ct) {
                                    return ct.id !== newContactEl.id
                                });
                                saveToLocalStorage('applications', applications);
                                contactsList.querySelectorAll('.list-group-item').forEach(function (li) {
                                    if (li.id === newContactEl.id) {
                                        contactsList.removeChild(li);
                                    }
                                });
                            });
                            return newContactEl;
                        }
                        // show todos
                        let todoListEl = document.getElementById('todo').querySelector('ul');
                        currentApplication[0].todo.forEach(function (todo) {
                            if (!todoListEl.querySelector(`[data-todo-id="${todo.id}"]`)) {
                                let newTodoEl = createTodoLiEl(todo);
                                todoListEl.appendChild(newTodoEl);
                            }
                        });
                        // add new todo
                        let todoAddBtn = document.getElementById('new-todo-btn');
                        todoAddBtn.addEventListener('click', function (todoBtnClickEv) {
                            todoBtnClickEv.stopPropagation();
                            if (!document.getElementById('todo-input').value ||
                                document.getElementById('todo-input').value === '') return;
                            let newTodoObj = {};
                            newTodoObj['id'] = uuidv4();
                            newTodoObj['isChecked'] = false;
                            newTodoObj['description'] = document.getElementById('todo-input').value;
                            currentApplication[0].todo.push(newTodoObj);
                            saveToLocalStorage('applications', applications);
                            let newTodoEl = createTodoLiEl(newTodoObj);
                            todoListEl.appendChild(newTodoEl);
                        });
                        // create new todo li from todo template
                        function createTodoLiEl(todoObj) {
                            let newTodoEl = todoTemplateEl.cloneNode(true);
                            newTodoEl.hidden = false;
                            newTodoEl.id = todoObj.id;
                            newTodoEl.setAttribute('data-app-id', currentApplication[0].id);
                            newTodoEl.setAttribute('data-todo-id', todoObj.id);
                            newTodoEl.querySelector('#todo-descp').innerText = todoObj.description;
                            newTodoEl.querySelector('input').checked = todoObj.isChecked;
                            newTodoEl.querySelector('input').addEventListener('click', function (todoCheckedEv) {
                                let toChangeTodo = currentApplication[0].todo.filter(function (todo) {
                                    return todo.id === newTodoEl.id
                                });
                                if (toChangeTodo.length > 0) {
                                    toChangeTodo[0].isChecked = todoCheckedEv.target.checked;
                                    saveToLocalStorage('applications', applications);
                                }
                            });
                            newTodoEl.querySelector('.btn-close').addEventListener('click', function (delTodoEv) {
                                currentApplication[0].todo = currentApplication[0].todo.filter(function (todo) {
                                    return todo.id !== newTodoEl.id
                                });
                                saveToLocalStorage('applications', applications);
                                todoListEl.querySelectorAll('li').forEach(function (li) {
                                    if (li.id === newTodoEl.id) {
                                        todoListEl.removeChild(li);
                                    }
                                });
                            });
                            return newTodoEl;
                        }
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
                            // console.log(selectedResume[0]);
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
            // console.log(fileSelectEvent.target.files);
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
                        // console.log(resumeObj);
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
                // console.log(ctrl.value);
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
        // console.log('export table btn');
        // check if no applications
        if (applications.length === 0) return;
        let blob = new Blob([JSON.stringify(getFromLocalStorage('applications'))],
            { type: 'application/json' });
        let fileUrl = blobToURL(blob);
        let tempLink = document.createElement('a');
        tempLink.href = fileUrl;
        tempLink.download = `applications-${new Date().toLocaleDateString()}`;
        tempLink.target = '_blank';
        tempLink.click();
        setTimeout(function () {
            tempLink = null;
            fileUrl = null;
            blob = null;
        }, 2000)
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