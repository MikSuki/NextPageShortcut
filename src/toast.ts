import Toastify from "toastify-js"

export function toast(text: string) {
    Toastify({
        text,
        duration: 600,
        gravity: "top",
        position: "left",
        style: {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#333",
            color: "#fff",
            padding: "1em 2em",
            borderRadius: "8px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
            zIndex: "9999",
            textAlign: "center",
            whiteSpace: "nowrap"
        },
        stopOnFocus: false
    }).showToast()

}
