function openScreen(key, value, existing = false) {
    console.log({
        request: !value ? `["${key}"]` : (`["${key}" , "${value}", "${existing}"]`),
        persistent: false,
        onSuccess: function (response) {
            print(response);
        },
        onFailure: function (error_code, error_message) {}
    })
    window.propCoFunction({
        request: !value ? `["${key}"]` : (`["${key}" , "5181", "${existing}"]`),
        persistent: false,
        onSuccess: function (response) {
            print(response);
        },
        onFailure: function (error_code, error_message) {}
    });
}

function openScreenAdvance(data) {
    window.propCoFunctionAdvanced({
        request: `${JSON.stringify(data)}`,
        persistent: false,
        onSuccess: function (response) {
            print(response);
        },
        onFailure: function (error_code, error_message) {}
    });
}