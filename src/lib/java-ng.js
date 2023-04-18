function openScreen(key, value, existing = false) {
    window.propCoFunction({
        request: !value ? `["${key}"]` : (`["${key}" , "${value}", "${existing}"]`),
        persistent: false,
        onSuccess: function (response) {
            print(response);
        },
        onFailure: function (error_code, error_message) {}
    });
}