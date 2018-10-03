package irmagobridge

import (
	"encoding/base64"
	"github.com/privacybydesign/irmago/irmaclient"
	"log"
)

type RecoveryAction struct {
	BackupData     string
	RecoveryPhrase []string
}

type RecoveryPinAction struct {
	Pin     string
	Proceed bool
}

type RecoveryHandler struct {
	newClient      chan *irmaclient.Client
	pin            chan *string
	backup         []byte
	recoveryPhrase []string
}

func New() *RecoveryHandler {
	return &RecoveryHandler{
		newClient:      make(chan *irmaclient.Client),
		pin:            make(chan *string),
		backup:         nil,
		recoveryPhrase: nil,
	}
}

func (rh *RecoveryHandler) RecoveryCancelled() {
	log.Println("Recovery cancelled")
	rh.newClient <- nil
}

func (rh *RecoveryHandler) RequestPin(remainingAttempts int, callback irmaclient.PinHandler) {
	log.Println("PIN requested for recovery")
	sendAction(&OutgoingAction{
		"type":              "IrmaClient.RecoveryStatus",
		"status":            "requestPin",
		"remainingAttempts": remainingAttempts,
	})

	p := <-rh.pin
	callback(p != nil, *p)
}

func (rh *RecoveryHandler) RequestPhrase(callback irmaclient.PhraseHandler) {
	log.Println(rh.recoveryPhrase)
	callback(true, rh.recoveryPhrase)
}

func (rh *RecoveryHandler) ShowPhrase(phrase []string) {
	log.Println(phrase)
	sendRecoveryPhrase(phrase)
}

func (rh *RecoveryHandler) OutputBackup(backup []byte) {
	log.Println("Output backup file")
	sendAction(&OutgoingAction{
		"type":   "IrmaClient.RecoveryBackup",
		"backup": base64.StdEncoding.EncodeToString(backup),
	})
}

func (rh *RecoveryHandler) GetBackup(callback irmaclient.BackupHandler) {
	callback(true, rh.backup)
}

func (rh *RecoveryHandler) RecoveryPinOk() {
}

func (rh *RecoveryHandler) RecoveryInitSuccess() {
	log.Println("Recovery init successful")
	sendRecoveryIsConfigured()
}

func (rh *RecoveryHandler) RecoveryPerformed(newClient *irmaclient.Client) {
	log.Println("Recovery was successful")
	rh.newClient <- newClient
}

func (rh *RecoveryHandler) RecoveryBlocked(duration int) {
	//TODO: Handle wrong PINs
	sendAction(&OutgoingAction{
		"type":              "IrmaClient.RecoveryStatus",
		"status":            "blocked",
		"remainingAttempts": 0,
		"blocked":           duration,
	})
}

func (rh *RecoveryHandler) RecoveryError(err error) {
	log.Println("Error in recovery")
	log.Println(err)
	rh.newClient <- nil
}
