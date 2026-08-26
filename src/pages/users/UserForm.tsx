export function UserForm(){

    return (
        <>
            <form className="sm:grid grid-cols-12 gap-x-6 gap-3 mt-0">
    <div className="md:col-span-6 col-span-12">
        <label className="form-label">First Name</label>
        <input type="text" className="ti-form-control" placeholder="First name"
            aria-label="First name" />
    </div>
    <div className="md:col-span-6 col-span-12">
        <label className="form-label">Last Name</label>
        <input type="text" className="ti-form-control" placeholder="Last name"
            aria-label="Last name" />
    </div>
    <div className="md:col-span-6 col-span-12">
        <label  htmlFor="inputEmail4" className="form-label">Email</label>
        <input type="email" className="ti-form-control" id="inputEmail4" placeholder="Email id" />
    </div>
    <div className="md:col-span-6 col-span-12">
        <label  htmlFor="inputPassword4" className="form-label">Password</label>
        <input type="password" className="ti-form-control" id="inputPassword4" placeholder="Password" />
    </div>
    <div className="col-span-12 ">
        <label  htmlFor="inputAddress" className="form-label">Address</label>
        <input type="text" className="ti-form-control" id="inputAddress"
            placeholder="1234 Main St" />
    </div>
    <div className="col-span-12 ">
        <label  htmlFor="inputAddress2" className="form-label">Address 2</label>
        <input type="text" className="ti-form-control" id="inputAddress2"
            placeholder="Apartment, studio, or floor" />
    </div>
    <div className="md:col-span-6 col-span-12">
        <label  htmlFor="inputCity" className="form-label">City</label>
        <input type="text" className="ti-form-control" id="inputCity" />
    </div> 
    <div className="md:col-span-4 col-span-12">
        <label  htmlFor="inputState" className="form-label">State</label>
        <select id="inputState" className="form-select form-select-lg">
            <option value="Choose...">Choose...</option>
            <option value="...">...</option>
        </select>
    </div>
    <div className="md:col-span-2 col-span-12">
        <label  htmlFor="inputZip" className="form-label">Zip</label>
        <input type="text" className="ti-form-control" id="inputZip" />
    </div>
    <div className="col-span-12">
        <div className="form-check">
            <input className="form-check-input" type="checkbox" id="gridCheck3" />
            <label className="form-check-label"  htmlFor="gridCheck3">
                Check me out
            </label>
        </div>
    </div>
    <div className="col-span-12">
        <button type="submit" className="ti-btn ti-btn-primary">Sign in</button>
    </div>
</form>
        </>
    );
}