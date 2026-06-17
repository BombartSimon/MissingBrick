package service

import "errors"

var (
	ErrInvalidInput        = errors.New("invalid input")
	ErrNotFound            = errors.New("not found")
	ErrConflict            = errors.New("conflict")
	ErrUpstreamUnavailable = errors.New("upstream unavailable")
	ErrUpstreamNotFound    = errors.New("upstream not found")
	ErrUpstreamRateLimited = errors.New("upstream rate limited")
)
