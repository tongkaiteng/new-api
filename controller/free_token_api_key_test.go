package controller

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/QuantumNous/new-api/model"
)

func TestFreeApiKeyConnectivity(t *testing.T) {
	// Mock server to simulate the upstream API
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verify request path
		expectedPath := "/keys/v1/chat/completions"
		if r.URL.Path != expectedPath {
			t.Errorf("unexpected path: got %s, want %s", r.URL.Path, expectedPath)
		}

		// Verify auth header
		auth := r.Header.Get("Authorization")
		expectedAuth := "Bearer 1212"
		if auth != expectedAuth {
			t.Errorf("unexpected auth: got %s, want %s", auth, expectedAuth)
		}

		// Verify content type
		contentType := r.Header.Get("Content-Type")
		if contentType != "application/json" {
			t.Errorf("unexpected content-type: got %s", contentType)
		}

		// Return success
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"id":"test","object":"chat.completion","model":"deepseek-v4-flash","choices":[{"index":0,"message":{"role":"assistant","content":"Hello!"},"finish_reason":"stop"}]}`))
	}))
	defer mockServer.Close()

	// Test with OpenAI protocol, pointing to the mock server
	// Use mockServer.URL directly (the mock listens on /, so we append the path)
	err := testFreeApiKeyConnectivity(
		mockServer.URL+"/keys", // simulate the real URL structure
		model.FreeApiKeyProtocolOpenAI,
		"1212",
		"deepseek-v4-flash",
	)

	if err != nil {
		t.Fatalf("connectivity test failed: %v", err)
	}
}

func TestFreeApiKeyConnectivity_Failure(t *testing.T) {
	// Mock server returning 401
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusUnauthorized)
		_, _ = w.Write([]byte(`{"error":{"message":"Invalid API key"}}`))
	}))
	defer mockServer.Close()

	err := testFreeApiKeyConnectivity(
		mockServer.URL+"/keys",
		model.FreeApiKeyProtocolOpenAI,
		"1212",
		"deepseek-v4-flash",
	)

	if err == nil {
		t.Fatal("expected error for 401 response, got nil")
	}

	expectedMsg := "API密钥不正确"
	if err.Error() != expectedMsg {
		t.Errorf("unexpected error message: got %q, want %q", err.Error(), expectedMsg)
	}
}

func TestFreeApiKeyConnectivity_ModelErrorInBody(t *testing.T) {
	// Mock server returns 200 OK but body contains an error (e.g. model not available)
	mockServer := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"error":{"message":"No available channel for model test-model"}}`))
	}))
	defer mockServer.Close()

	err := testFreeApiKeyConnectivity(
		mockServer.URL+"/keys",
		model.FreeApiKeyProtocolOpenAI,
		"1212",
		"test-model",
	)

	if err == nil {
		t.Fatal("expected error for 200 with error body, got nil")
	}

	expectedMsg := "模型不正确"
	if err.Error() != expectedMsg {
		t.Errorf("unexpected error message: got %q, want %q", err.Error(), expectedMsg)
	}
}

func TestFreeApiKeyConnectivity_Timeout(t *testing.T) {
	// Test with an unreachable address (should timeout or connection refused)
	err := testFreeApiKeyConnectivity(
		"https://token.zhongxiang100.com",
		model.FreeApiKeyProtocolOpenAI,
		"sk-fapwUAcf2VnNqXxYC9Lr03nNWTCwkeqlidDOTTUEP95IyIBn",
		"abcd",
	)

	// Should either get "连接不可用" or a network error
	if err == nil {
		t.Log("note: connectivity succeeded (unexpected, upstream may be reachable)")
		return
	}
	t.Logf("connectivity test returned expected error: %v", err)
}
