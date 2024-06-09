'use strict';

function createLoginForm() {
    return`<form method="POST" id="login-form" class="col-6 mx-auto margintop-3">            
                <div id="error-messages"></div>
                <div class="form-group">
                    <label id="email">Indirizzo mail</label>
                    <input type="email" name="email" class="form-control" required />
                </div>

                <div class="form-group margintop-0">
                    <label id="password">Password</label>
                    <input type="password" name="password" class="form-control" required autocomplete="on"/>
                </div>
                <button type="submit" class="btn btn-info margintop-0 btn-center">Login</button>
            </form>`;
}

export default createLoginForm;