var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var nodemailer = require("nodemailer");
var port = process.env.PORT || 3000;

// SDK de Mercado Pago
const mercadopago = require("mercadopago");

// Agrega credenciales
mercadopago.configure({
    access_token:
        "APP_USR-8208253118659647-112521-dd670f3fd6aa9147df51117701a2082e-677408439",
});

var app = express();

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(express.static("assets"));

app.use("/assets", express.static(__dirname + "/assets"));

app.use(bodyParser.text({ type: "*/*" }));

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/success", function (req, res) {
    res.render("success", { ...req.query });
});
app.get("/failure", function (req, res) {
    res.render("failure");
});
app.get("/pending", function (req, res) {
    res.render("pending");
});

app.get("/detail", function (req, res) {
    // Crea un objeto de preferencia
    let preference = {
        back_urls: {
            success: req.headers.host + "/success",
            failure: req.headers.host + "/failure",
            pending: req.headers.host + "/pending",
        },
        notification_url: req.headers.host + "/ipn",
        auto_return: "approved",
        payment_methods: {
            excluded_payment_methods: [
                {
                    id: "diners",
                    id: "atm",
                },
            ],
            installments: 6,
        },
        items: [
            {
                id: 1234,
                title: req.query.title,
                description: "Dispositivo móvil de Tienda e-commerce",
                unit_price: parseInt(req.query.price),
                quantity: 1,
                picture_url: req.headers.host + "/" + req.query.img,
            },
        ],
        payer: {
            name: "Lalo",
            surname: "Landa",
            email: "test_user_46542185@testuser.com",
            phone: {
                area_code: "52",
                number: 5549737300,
            },
            identification: {
                type: "DNI",
                number: "22334445",
            },
            address: {
                street_name: "Insurgentes Sur",
                street_number: 1602,
                zip_code: "03940",
            },
        },
        external_reference: "eduardo.devop@gmail.com",
        "x-integrator-id": "dev_2e4ad5dd362f11eb809d0242ac130004",
    };

    mercadopago.preferences
        .create(preference)
        .then(function (response) {
            res.render("detail", {
                ...req.query,
                global_id: response.body.id,
                init_point: response.body.init_point,
            });
        })
        .catch(function (error) {
            console.log(error);
        });
});

app.post("/ipn", function (req, res) {
    const transport = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "cbb64d62ae5f7a",
            pass: "a54df7dbc3dde2",
        },
    });

    const mailOptions = {
        from: '"Mercado pago" <test@example.com>',
        to: "example@domain.com",
        subject: "Nueva notificación - " + new Date(),
        text: req.body,
    };

    res.send({ ok: true });

    transport.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        }
        console.log("Info: ", info);
    });
});

app.listen(port);
