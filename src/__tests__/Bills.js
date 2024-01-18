/**
 * @jest-environment jsdom
 */
import {screen, waitFor} from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import '@testing-library/jest-dom/extend-expect'
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import router from "../app/Router.js"
import store from "../__mocks__/store"

// Simule un environnement local pour le test
//une entrée 'user' est ajoutée à localStorage avec conversion en chaine de caractère, Cet objet représente un utilisateur de type 'Employee'.
const initializeTestEnvironment = async => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee'
  }))

  const root = document.createElement("div")
  root.setAttribute("id", "root") 
  document.body.append(root)

  router() 
}

describe("Given I am a user connected as Employee", () => {
	describe("When I navigate to BillUI", () => {
    beforeEach(() => {
      initializeTestEnvironment()
    })

    afterEach( () => {
      jest.clearAllMocks()
    })

    // Test 1 : Données / Verification de la récupération des factures via une api fictive   
    test("Then fetches bills from mock API GET", async () => {
      const getSpyOn = jest.spyOn(store, "bills");

      const bills = await store.bills().list()

      expect(getSpyOn).toHaveBeenCalledTimes(1)
      expect(bills.length).toBe(4)
    })

    // Test 2 : Données / Verification du comportement en cas d'erreur 404 
    test("Then fetches bills failed and we might have a 404 message error", async () => {
      store.bills.mockRejectedValueOnce(new Error("Erreur 404"))

      document.body.innerHTML = BillsUI({ error: "Erreur 404" })
      const message = await screen.getByText(/Erreur 404/)

      expect(message).toBeTruthy()
    })

    // Test 3 : Données / Verification du comportement en cas d'erreur 404 
    test("Then fetches bills failed and we might have a 500 message error", async () => {
      store.bills.mockRejectedValueOnce(new Error("Erreur 500"))

      document.body.innerHTML = BillsUI({ error: "Erreur 500" })
      const message = await screen.getByText(/Erreur 500/)


      expect(message).toBeTruthy();
    })
  })

  describe("When I am on Bills Page", () => {

    // Test 4 : Affichage / Icone verticale 
    test("Then bill icon in vertical layout should be highlighted", async () => {

      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      expect(windowIcon).toHaveClass('active-icon')

    })

    // Test 5 : Affichage / Présence du titre et du bouton Nouvelle Note de frais
    test("Then, The page got a title 'Mes notes de frais' and there is a button 'Nouvelle Note de frais'", () => {
      document.body.innerHTML = BillsUI({ data: [] })

      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy()
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
    })

    // Test 6 : Affichage / Ordre d'affichage des factures avec tri du plus recent au plus ancien
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    // Test 7 : Affichage / Si aucune facture dans la base, aucun affichage de facture
    test("Then if the data contain no bills, no bills might be displayed", () => {
      document.body.innerHTML = BillsUI({ data: [] })
			const bill = screen.queryByTestId("bill")
			expect(bill).toBeNull()
    })

  
    // Test 8 : Interaction / Si on clique sur l'oeil cela ouvre une modale
    test("Then when clicking on the eyes icon of a bill might open a modal", () => {

      document.body.innerHTML = BillsUI({ data: bills })

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const store = null
      const bill = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      })

      const modale = document.getElementById("modaleFile")
      $.fn.modal = jest.fn(() => modale.classList.add("show"))

      const eye = screen.getAllByTestId("icon-eye")[0]
      const handleClickIconEye = jest.fn(() => bill.handleClickIconEye(eye))

      eye.addEventListener("click", handleClickIconEye)
      userEvent.click(eye)
      
      expect(handleClickIconEye).toHaveBeenCalled()
      expect(modale).toHaveClass("show")
      expect(bills[0].fileUrl).toBeTruthy()
      expect(screen.getByText("Justificatif")).toBeInTheDocument()  
      })

    // Test 9 : Interaction / Le bouton Nouvelle note de frais navigue vers la page Newbill
    test("Then clicking on the 'Nouvelle note de frais' button should navigate to NewBill", async () => {
      const newBillButton = screen.getByTestId('btn-new-bill')
      const onNavigate = jest.fn(() => window.onNavigate(ROUTES_PATH.NewBill))
      const store = null

			const bill = new Bills({
				document,
				onNavigate,
				store,
				localStorage: window.localStorage,
			})

      // handle click event
      const handleClickNewBill =  jest.fn(() => bill.handleClickNewBill())
      newBillButton.addEventListener('click', handleClickNewBill)
      userEvent.click(newBillButton)

      // expected results
      expect(handleClickNewBill).toHaveBeenCalled()
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
    })
  })
})
