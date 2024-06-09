'use strict';

function createRegisterForm() {
    return `<!-- Register template -->
            <form method="POST" id="register-form" class="col-6 mx-auto below-nav row g-3 margintop-3">
              
              <div id="error-messages"></div>

              <!-- Name & Surname -->
              <div class="col-md-6">
                <label for="name" class="form-label">Nome</label>
                <input type="text" class="form-control" id="name" name="name" required>
              </div>
              <div class="col-md-6">
                <label for="surname" class="form-label">Cognome</label>
                <input type="text" class="form-control" id="surname" name="surname" required>
              </div>

              <!-- Email -->
              <div class="col-12">
                <label for="email" class="form-label">Email</label>
                <input type="email" class="form-control" id="email" name="email" required>
              </div>

              <!-- Password -->
              <div class="col-md-6">
                <label for="password" class="form-label">Password</label>
                <input type="password" class="form-control" id="password" name="password" required>
              </div>
              <div class="col-md-6">
                <label for="passwordConfirm" class="form-label">Conferma password</label>
                <input type="password" class="form-control" id="passwordConfirm" name="passwordConfirm" required>
              </div>

              <!-- Role -->
              <div class="col-12">
                <label for="role" class="form-label">Ruolo</label>
                <select class="form-select" id="role" name="role" required>
                  <option selected disabled label="Scegli il tuo ruolo"></option>
                  <option value="1">Creatore</option>
                  <option value="2">Finanziatore</option>
                </select>
              </div>
              
              <div class="col-12">
                <button type="submit" class="btn btn-info margintop-0 btn-center">Registrati</button>
              </div>
            </form>`;
}

export default createRegisterForm;