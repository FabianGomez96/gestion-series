let form = document.getElementById("registrarSerie");
let formSeasons = document.getElementById("formularioTemporadas");
let viewSeasonsSerie = document.getElementById("verTemporadas");
const addButtons = document.querySelectorAll(".add-btn");
let seasons;
let series;

/**
 * Obtener todas las series y temporadas
 */
async function getData() {
    try {

        const response = await fetch("./controllers/read.php");
        if (!response.ok) {
            throw new Error('Ocurrió un error al hacer la solicitud.');
        }

        const data = await response.json();
        
        if (data.success) {
            series = data.series;
            seasons = data.seasons;
            createCards(data);
            fillSelect(data.series);
        } else {
            ShowNotification(data.message, "error");
        }


    } catch (error) {
        
        ShowNotification(error.message, "error");
    }
}

/**
 * llenar las opciones de serie en el formulario de temporadas
 */
function fillSelect(data) {
    let select = document.getElementById("opcionesSerie")
    let option = ""

    if (data.length > 0) {
        option = "<option value=''>Seleccione una serie</option>"
        data.forEach(serie => {
            option += `<option value="${serie.id}">${serie.nombre}</option>`
        });
    } else {
        option = "<option value=''>No hay series registradas</option>"
    }

    select.innerHTML = option
}

/**
 * Crear la card con los datos de la serie
 */
function createCards(data) {

    const divInformation = document.querySelector("#informacion");
    divInformation.innerHTML = "";

    const series = data.series;
    if (series.length) {
        const divSeries = document.createElement("div");
        divSeries.classList.add("series-container");

        const seasons = data.seasons;
        let cards = "";

        series.forEach(serie => {

            const getSeasons = seasons.filter(season => season.id_serie == serie.id);

            let infoSeasons = "";
            if (getSeasons.length) {
                infoSeasons = `${getSeasons.length} Temp`;
                infoSeasons += `<i class="bi bi-eye-fill" title="Ver detalles" onclick="viewSeasons(${serie.id})"></i>`;
            } else {
                infoSeasons = "Sin temporadas";
            }

            cards += `
                <div class="card">
                    <img src="${serie.url_poster}" onerror="this.src='https://res.cloudinary.com/goku10/image/upload/v1728248440/imagen-no-disponible.png';" />
                    <div class="card-body">
                        <h3 class="title-serie">${serie.nombre}</h3>
                        <h4 class="seasons">${infoSeasons}</h4>
                        <p class="produccion">${serie.produccion}</p>
                        <div class="gender">${serie.genero}</div>
                    </div>
                    <div class="actions">
                        <i class="bi bi-trash-fill delete" onclick="askDelete(${serie.id}, 'serie')"></i>
                        <i class="bi bi-pencil-square update" onclick="updateSerie(${serie.id})"></i>
                    </div>
                </div>
            `
        });
        divSeries.innerHTML = cards;
        divInformation.classList.add("hidden");
        divInformation.appendChild(divSeries);
        setTimeout(() => divInformation.classList.remove("hidden"), 300);

    } else {
        divInformation.innerHTML = `<p class="no-records">No hay registros en la base de datos</p>`
    }

}

/**
 * Mostrar notificaciones
 */
function ShowNotification(message, className) {
    const notification = document.querySelector(".notification");
    notification.textContent = message;
    notification.classList.remove("error", "success");
    notification.classList.add("show", className);

    setTimeout(() => {
        notification.classList.remove("show");
    }, 4000)
}

/**
 * Abrir el modal
 */
function openModal(modal) {
    modal.classList.add("show");
    const body = document.body;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    body.style.cssText = `overflow: hidden; padding-right: ${scrollbarWidth}px;`;
    body.setAttribute('data-scroll-position', scrollPosition);
    //body.classList.add("modal-open");
}

/**
 * Cerrar el modal
 */
function closeModal(modal) {
    modal.classList.remove("show");
    setTimeout(() => {
        document.body.style.cssText = "";
        window.scrollTo(0, document.body.dataset.scrollPosition);
        if (modal.id == "modalAgregar" || modal.id == "modalAgregarTemporadas") {
            const btnSend = modal.querySelector(".btn-primary");
            btnSend.textContent = "Agregar"
            const form = modal.querySelector("form")
            clearFields(form);
            if (modal.id == "modalAgregarTemporadas"){
                const divSelect = form.querySelector(":first-child");
                divSelect.style.display = "block";

                const select = form.querySelector("select");
                select.setAttribute('required', true);
            }
        }
    }, 400)
}

/**
 * Preguntar si desea eliminar una serie
 */
function askDelete(id, option) {
    const modalConfirm = document.querySelector("#confirmar");

    if (option == "season") {

        const modalViewSeasons = document.getElementById("verTemporadas")

        closeModal(modalViewSeasons);

        setTimeout(() => {
            openModal(modalConfirm);
        }, 400)
    } else {
        openModal(modalConfirm);
    }

    // obtener el botón aceptar eliminar
    let acceptButton = document.getElementById("aceptar");

    // crear una copia del botón aceptar eliminar
    let newAcceptButton = acceptButton.cloneNode(true)

    // reemplazar el botón original por la copia, eliminando así todos los listeners previos
    acceptButton.replaceWith(newAcceptButton)

    // agregar el nuevo listener a la copia del botón
    newAcceptButton.addEventListener("click", () => {
        deleteRecord(id, option, modalConfirm);
    })

}

/**
 * Eliminar un registro
 */
async function deleteRecord(id, option, modal) {

    const idDelete = id
    let url = "";

    if (option == "serie") {
        url = "./controllers/delete.php";
    } else {
        url = "./controllers/deleteSeason.php";
    }

    const options = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: idDelete })
    }
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error('Ocurrió un error en la solicitud');
        }

        const data = await response.json();

        if (data.success) {
            ShowNotification(data.message, "success");
            closeModal(modal);
            getData();

        } else {
            ShowNotification(data.message, "error");
        }

    } catch (error) {
        ShowNotification(error.message, "error");
    }

}

/**
 * Actualizar una serie
 */
function updateSerie(id) {

    const getSerie = series.find(serie => serie.id == id);

    const genres = getSerie["genero"].split(", ");
    genres.forEach(genre => {
        const input = form.querySelector(`input[type='checkbox'][value='${genre}']`)
        if(input){
            input.checked = true
        }
    })

    form.querySelector("#name").value = getSerie["nombre"];
    form.querySelector("#production").value = getSerie["produccion"];
    form.querySelector("#urlImg").value = getSerie["url_poster"];
    
    const modalSerie = document.querySelector("#modalAgregar");
    openModal(modalSerie);

    const btnSend = document.getElementById('enviarDatos');
    btnSend.value = "actualizar"
    btnSend.textContent = "Actualizar";
    btnSend.setAttribute("data-id", id);

}

/**
 * Ver las temporadas de una serie
 */
function viewSeasons(idSerie) {

    // Buscar las temporadas asociadas a la serie
    const getSeasons = seasons.filter(season => season.id_serie == idSerie);
    const containerSeasons = document.getElementById("detallesTemporadas");
    containerSeasons.innerHTML = "";

    let cards = ""
    getSeasons.forEach((season, index) => {
        const dateFormat = season.fecha_estreno.split("-").reverse().join("/");
        cards += `
            <div class="container-season">
                <div>
                    <img src="${season.url_poster}" onerror="this.src='./assets/img/imagen-no-disponible.png';" />
                </div>
                <div>
                    <div class="card-body">
                        <h4 class="card-title">Temporada ${index + 1}</h4>
                        <p class="card-text">Episodios: <span>${season.episodios}</span></p>
                        <p class="card-text">Fecha de estreno: <span>${dateFormat}</span></p>
                        <div class="box-btn">
                            <button type="button" onclick="editSeason(${season.id})" class="btn btn-primary"><i class="bi bi-pencil-square"></i>Editar</button>
                            <button type="button" onclick="askDelete(${season.id},'season')" class="btn btn-danger"><i class="bi bi-trash3"></i>Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        `
    })
    containerSeasons.innerHTML = cards;
    containerSeasons.scrollTop = 0;

    const modal = document.querySelector("#verTemporadas");
    openModal(modal);

}


/**
 * Editar temporadas
 */
function editSeason(idSeason) {

    // Buscar la temporada según el id
    const season = seasons.find(season => season.id == idSeason);
    const select = formSeasons.elements[0];
    select.removeAttribute('required');
    select.value = season.id_serie;

    const divSelect = formSeasons.querySelector(":first-child");
    divSelect.style.display = "none";
    
    // Llenar los campos del formulario
    formSeasons.elements[1].value = season.episodios;
    formSeasons.elements[2].value = season.fecha_estreno;
    formSeasons.elements[3].value = season.url_poster;

    // Cambiar los datos del botón en el formulario
    const btnForm = document.getElementById("enviarTemporada");
    btnForm.textContent = "Actualizar";
    btnForm.setAttribute("data-id", idSeason);

    // obtener los modales para cerrar y abrir
    const modalAddSeasons = document.getElementById("modalAgregarTemporadas");
    const modalViewSeasons = document.getElementById("verTemporadas");

    closeModal(modalViewSeasons);

    setTimeout(() => {
        openModal(modalAddSeasons);
    }, 400);

}

/**
 * Limpiar campos del formulario
 */
function clearFields(form) {

    for (let i = 0; i < form.elements.length; i++) {
        let input = form.elements[i];
        if (input.type != "submit") {
            if(input.type == "checkbox"){
                input.checked = false;
            }else {
                input.value = "";
            }
        }
    }
}

/**
 * Agregar evento click a los botones que abren el modal con el formulario
 */
addButtons.forEach((btn, index) => {
    let modal;
    if (index == 0) {
        modal = document.querySelector("#modalAgregar");
    } else {
        modal = document.querySelector("#modalAgregarTemporadas");
    }
    btn.addEventListener("click", event => {
        openModal(modal);
    });
});

/**
 * Agregar evento click a la ventana
 */
window.addEventListener('click', (event) => {

    if (event.target.classList.contains("modal")) {
        closeModal(event.target);
    }

    if (event.target.classList.contains("btn-close") || event.target.classList.contains("btn-secondary")) {

        const divModal = event.target.closest(".modal");
        closeModal(divModal);
    }

});

/**
 * Enviar datos del formulario de series
 */
async function sendForm(e) {

    e.preventDefault();

    const name = this.querySelector("#name").value.trim().replace(/\s+/g, " ");
    const genres = this.querySelectorAll("input[type='checkbox']:checked");
    const production = this.querySelector("#production").value.trim().replace(/\s+/g, " ");
    const urlImg = this.querySelector("#urlImg").value.trim().replace(/\s+/g, " ");

    if (!name || !production || !urlImg) {
        const message = "Ningún campo debe estar vació";
        ShowNotification(message, "error")
        return
    }
    if (!genres.length) {
        const message = "Seleccione al menos un genero";
        ShowNotification(message, "error")
        return
    }


    const formButton = document.getElementById("enviarDatos");
    const formData = new FormData(this);
    let url;
    let isUpdateButton = false;

    if (formButton.textContent == "Agregar") {
        url = "./controllers/create.php";
    } else {
        isUpdateButton = true;
        url = "./controllers/update.php";
        formData.append('id', formButton.getAttribute("data-id"));
    }

    try {

        const response = await fetch(url, { method: "POST", body: formData });

        if (!response.ok) {
            throw new Error('Ocurrió un error al hacer la solicitud.');
        }

        const data = await response.json();


        if (data.success) {

            if (isUpdateButton) {
                const modalSerie = document.querySelector("#modalAgregar");
                closeModal(modalSerie);

            }
            ShowNotification(data.message, "success");
            clearFields(this);
            getData();

        } else {
            ShowNotification(data.message, "error");
        }

    } catch (error) {
        ShowNotification(error.message, "error");
    }
}

/**
 * Enviar datos del formulario temporadas
 */
async function sendSeasonForm(e) {

    e.preventDefault()

    const urlImg = formSeasons.elements[3].value.trim().replace(/\s+/g, " ");

    if (!urlImg) {
        const message = "Ningún campo debe estar vació";
        ShowNotification(message, "error");
        return
    }

    const btnForm = document.getElementById("enviarTemporada");
    const formData = new FormData(this);
    let url;
    let isUpdateButton = false;
    if (btnForm.textContent == "Agregar") {
        url = "./controllers/createSeasons.php"
    } else {
        url = "./controllers/updateSeasons.php"
        isUpdateButton = true;
        const idSeason = btnForm.getAttribute("data-id");
        formData.append('idSeason', idSeason);
    }

    try {
        const response = await fetch(url, { method: "POST", body: formData });

        if (!response.ok) {
            throw new Error('Ocurrió un error al hacer la solicitud.');
        }
        
        const data = await response.json();

        if (data.success) {
            getData();
            if (isUpdateButton) {
                const modalSeasons = document.querySelector("#modalAgregarTemporadas");
                closeModal(modalSeasons);

            }
            ShowNotification(data.message, "success");
            clearFields(this);
            
        } else {
            ShowNotification(data.message, "error");
        }
    } catch (error) {
        ShowNotification(error.message, "error");
    }

}

// Evento enviar el formulario de series
form.addEventListener("submit", sendForm);

// Evento enviar el formulario de temporadas
formSeasons.addEventListener("submit", sendSeasonForm)

// Evento cuando se abre la pagina
document.addEventListener("DOMContentLoaded", getData)