/**
 * @jest-environment jsdom
 */
import {fireEvent, screen, waitFor} from "@testing-library/dom"
import userEvent from "@testing-library/user-event"
import '@testing-library/jest-dom/extend-expect'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {ROUTES_PATH} from "../constants/routes.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import store from "../__mocks__/store.js"

import router from "../app/Router.js"


// Simule un environnement local pour le test
const initializeTestEnvironment = async => {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock })
  window.localStorage.setItem('user', JSON.stringify({
  type: 'Employee',
  email: "employee@test.tld",
  status: "connected",
  }))

  const root = document.createElement("div")
  root.setAttribute("id", "root") 
  document.body.append(root)

  router() 
}

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      document.body.innerHTML = ""
      initializeTestEnvironment()
    })

    afterEach(() => {
      jest.clearAllMocks()
    })
   
    //Test 1 : L'icone enveloppe doit être highlight
    test("Then bill icon in vertical layout should be highlighted", async () => {
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')

      expect(mailIcon).toHaveClass('active-icon')
    })

    // Test 2 : L'affichage du formulaire est correct
    test("Then the title of the form is display", () => {
      document.body.innerHTML = NewBillUI()
      expect(screen.getAllByText('Envoyer une note de frais')).toHaveLength(1)
    })

    //Test 3 : Il y a 9 champs dans le formulaire
    test("Then there is 9 form fields ", () => {
      window.onNavigate(ROUTES_PATH.NewBill)
      const form = document.querySelector('form')

      expect(form.length).toEqual(9)    
    })
  
    //Test 4 : Il y a un bouton envoyer
    test("Then there is a button 'envoyer' to send",  () => {
    window.onNavigate(ROUTES_PATH.NewBill)
    const sendButton = document.querySelector("#btn-send-bill")
    
    expect(sendButton).toHaveAttribute('type', 'submit')  
    })
    
    describe("I'm uploading a file", () => {
      beforeEach(() => {
        document.body.innerHTML = ""
        initializeTestEnvironment()
      })
      afterEach(() => {
        jest.clearAllMocks()
      })

      //Test 5 : Apparition d'un message pop-up si l'extension est non valide
      test("Then the file have an not allowed extension, it should have a pop up message", () => {
        window.onNavigate(ROUTES_PATH.NewBill)
        document.body.innerHTML = NewBillUI()
  
        const store = null
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        })

        const linkedFile = screen.getByTestId("file")

        window.alert = jest.fn()

        linkedFile.addEventListener('change', newBill.handleChangeFile)
        fireEvent.change(linkedFile, {
          target: {
            files: [new File(['file.gif'], 'file.gif', { type: 'file/gif' })],
          },
        })

        jest.spyOn(window, "alert")
        expect(window.alert).toHaveBeenCalled()
      })
      
      
      //Test 6 : il n'y a pas de message pop-up si l'extension est valide
      test("Then the file have an allowed extension, it should not have a pop up message", () => {
        window.onNavigate(ROUTES_PATH.NewBill)
        document.body.innerHTML = NewBillUI()
  
        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        })

			  const linkedFile = screen.getByTestId("file")

        window.alert = jest.fn()

        linkedFile.addEventListener('change', newBill.handleChangeFile)
        fireEvent.change(linkedFile, {
          target: {
            files: [new File(['file.jpg'], 'file.jpg', { type: 'file/jpg' })],
          },
        })

        jest.spyOn(window, "alert")
        expect(alert).not.toHaveBeenCalled()
        expect(linkedFile.files[0].name).toBe("file.jpg")
      })  
    })
    
    describe("All the field are correctly filled and the user click on submit button", () => {
      beforeEach(() => {
        document.body.innerHTML = ""
        initializeTestEnvironment()
      })
      afterEach(() => {
        jest.clearAllMocks();
      })

      //Test 7 : La validation du formulaire se passe correctement
      test("Then the submit might call the handsubmit function", () => {
        window.onNavigate(ROUTES_PATH.NewBill)
        document.body.innerHTML = NewBillUI()

        const newBill = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        })
        const formNewBill = screen.getByTestId("form-new-bill")
			  const handleSubmit = jest.fn(newBill.handleSubmit)
			  formNewBill.addEventListener("submit", handleSubmit)
			  fireEvent.submit(formNewBill)

			  expect(handleSubmit).toHaveBeenCalled()
      })
    })
  })
})
