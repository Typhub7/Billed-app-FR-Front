import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }
  // Permet de naviguer vers la page de création de nouvelle note de frais lorsqu'on clique sur le bouton correspondant.
  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  // Gère l'affichage d'une modale avec la preuve de la facture associée à l'icône "eye" cliquée, 
  // en redimensionnant l'image pour s'adapter à la modale.
  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  // Utilise la méthode list du store pour récupérer la liste des factures, formate les données, 
  // Renvoie une Promise avec les factures formatées. 
  // Gère  les erreurs de formatage des dates en les loggant et renvoyant les dates non formatées en cas d'échec.
  getBills = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot  
          .map(doc => {
            try {
              // ajout du retour des dates non formatées pour permettre le tri dans billUi
              return {
                ...doc,
                date: doc.date,
                formatedDate: formatDate(doc.date),
                status: formatStatus(doc.status)
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              // console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date, 
                status: formatStatus(doc.status)
              }
            }
          })
        return bills
      })
    }
  }
}
