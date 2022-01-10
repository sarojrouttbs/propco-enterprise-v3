function openJavaLink(key, value) {
    window.propCoFunction({
        request: !value ? `["${key}"]` : (`["${key}" , "${value}"]`),
        persistent: false,
        onSuccess: function (response) {
            print(response);
        },
        onFailure: function (error_code, error_message) {}
    });
}