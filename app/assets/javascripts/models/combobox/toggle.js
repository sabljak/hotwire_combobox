import Combobox from "models/combobox/base"
import { disableBodyScroll, enableBodyScroll } from "vendor/bodyScrollLock"

Combobox.Toggle = Base => class extends Base {
  open() {
    this.expandedValue = true
  }

  close() {
    if (this._isOpen) {
      this._ensureSelection()
      this.expandedValue = false
    }
  }

  toggle() {
    if (this.expandedValue) {
      this.close()
    } else {
      this._openByFocusing()
    }
  }

  closeOnClickOutside(event) {
    const target = event.target

    if (this.element.contains(target) && !this._isDialogDismisser(target)) return
    if (this._withinElementBounds(event)) return

    this.close()
  }

  closeOnFocusOutside({ target }) {
    if (!this._isOpen) return
    if (this.element.contains(target)) return
    if (target.matches("main")) return

    this.close()
  }

  // Some browser extensions like 1Password overlay elements on top of the combobox.
  // Hovering over these elements emits a click event for some reason.
  // These events don't contain any telling information, so we use `_withinElementBounds`
  // as an alternative to check whether the click is legitimate.
  _withinElementBounds(event) {
    const { left, right, top, bottom } = this.element.getBoundingClientRect()
    const { clientX, clientY } = event

    return clientX >= left && clientX <= right && clientY >= top && clientY <= bottom
  }

  _ensureSelection() {
    if (!this._isValidNewOption(this._actingCombobox.value, { ignoreAutocomplete: true })) {
      this._select(this._selectedOptionElement, { force: true })
    }
  }

  _openByFocusing() {
    this._actingCombobox.focus()
  }

  _isDialogDismisser(target) {
    return target.closest("dialog") && target.role != "combobox"
  }

  _expand() {
    if (this._preselectOnExpansion) this._preselectOption()

    if (this._autocompletesList && this._smallViewport) {
      this._openInDialog()
    } else {
      this._openInline()
    }

    this._actingCombobox.setAttribute("aria-expanded", true) // needs to happen after setting acting combobox
  }

  _collapse() {
    this._actingCombobox.setAttribute("aria-expanded", false) // needs to happen before resetting acting combobox

    if (this.dialogTarget.open) {
      this._closeInDialog()
    } else {
      this._closeInline()
    }
  }

  _openInDialog() {
    this._moveArtifactsToDialog()
    this._preventFocusingComboboxAfterClosingDialog()
    this._preventBodyScroll()
    this.dialogTarget.showModal()
  }

  _openInline() {
    this.listboxTarget.hidden = false
  }

  _closeInDialog() {
    this._moveArtifactsInline()
    this.dialogTarget.close()
    this._restoreBodyScroll()
  }

  _closeInline() {
    this.listboxTarget.hidden = true
  }

  _preventBodyScroll() {
    disableBodyScroll(this.dialogListboxTarget)
  }

  _restoreBodyScroll() {
    enableBodyScroll(this.dialogListboxTarget)
  }

  get _isOpen() {
    return this.expandedValue
  }

  get _preselectOnExpansion() {
    return !this._isAsync // async comboboxes preselect based on callbacks
  }
}