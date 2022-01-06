function openJavaLink(key) {
    switch (key) {
        case 'OpenApplicantCard':
            window.propCoFunction({
                request: '["OpenApplicantCard"]',
                persistent: false,
                onSuccess: function (response) {
                    print(response);
                },
                onFailure: function (error_code, error_message) {}
            });
            break;
        default:
            // code block
    }
}