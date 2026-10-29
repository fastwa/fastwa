<p align="center">
  <a href="https://github.com/fastwa/fastwa" target="blank">
    <img src="https://avatars.githubusercontent.com/u/118643349" width="120" alt="Logo" />
  </a>
</p>

<p align="center">
  <p align="center">
   Next-generation framework for building efficient, reliable and scalable chatbots.
    <br/>
    <br/>
  </p>
</p>

<p align="center">
  <a href="https://github.com/fastwa/fastwa" target="_blank">
    <img src="https://img.shields.io/github/stars/fastwa/fastwa" alt="Stargazers" />
  </a>
  <a href="https://github.com/fastwa/fastwa" target="_blank">
    <img src="https://img.shields.io/github/issues/fastwa/fastwa" alt="Issues" />
  </a>
</p>

## Description

Fastwa is an open source project and an excellent way if you want an easy start. Perfect for building efficient and scalable [Whatsapp](https://web.whatsapp.com) applications.

## Getting started
* To check out the [guide](https://docs.fastwa.org), visit [docs.fastwa.org](https://docs.fastwa.org). :books:
* [가이드](https://docs.fastwa.org) 문서는 [docs.fastwa.org](https://docs.fastwa.org)에서 확인하실 수 있습니다. :books:
* [ガイド](https://docs.fastwa.org)は [docs.fastwa.org](https://docs.fastwa.org)でご確認ください。 :books:

## Requirements
* Node.js >= 20.19.0
* [Baileys](https://github.com/WhiskeySockets/Baileys) 7 (`@whiskeysockets/baileys@7.0.0-rc14`)

### Upgrading to Baileys v7
Read the official [v7 migration guide](https://baileys.wiki/migration/v7#v7-migration). What changes for Fastwa apps:
* **LIDs:** `@RemoteJid()` may return a LID (`123@lid`) instead of a phone number JID. Use `@RemoteJidAlt()` to get the other format. `CollectorService` accepts either one.
* **Auth state:** custom auth stores must support the `lid-mapping`, `device-list` and `tctoken` keys. `useMultiFileAuthState` already does.
* **QR code:** Fastwa does not render QR codes, and Baileys deprecated `printQRInTerminal`. Listen to `connection.update` and handle the `qr` field yourself (e.g. with `qrcode-terminal`).

## Contributing
### Contributing Guidelines
Read through our [contributing guidelines](https://github.com/fastwa/fastwa/blob/main/CONTRIBUTING.md) to learn about our submission process, coding rules, and more.

### Code of Conduct
Help us keep **fastwa** open and inclusive. Please read and follow our [Code of Conduct](https://github.com/fastwa/fastwa/blob/main/CODE_OF_CONDUCT.md).

## Acknowledgments
Special thanks to [@mrdiniz88](https://github.com/mrdiniz88) for inspiration.

## Stay in touch

* Author - [Natan Rodrigues](https://github.com/Nata4n)
* Website - [https://fastwa.org](https://fastwa.org)
* E-mail - [natanrce@proton.me](mailto:natanrce@proton.me)

## License

Distributed under the MIT License. See [LICENSE](https://github.com/fastwa/fastwa/blob/main/LICENSE) for more information.
