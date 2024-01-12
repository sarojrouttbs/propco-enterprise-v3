import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
export class ApplicationDetailsHelper {
    groupApplicantDetailsForm: FormGroup;
    applicantDetailSelectorControl: FormControl = new FormControl();
    leadDetailsFetched = false;
    constructor(private _fb: FormBuilder) {
        this.init();
    }

    private init() {
        this._initForms();
    }

    private _initForms() {
        this._initGroupApplicantForm();
    }

    _initGroupApplicantForm() {
        this.groupApplicantDetailsForm = this._fb.group(
            {
                list: this._fb.array([])
            }
        );
    }

}