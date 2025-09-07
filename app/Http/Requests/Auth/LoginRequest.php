<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Reglas de validación que se aplican a la petición.
     *
     * Este método define las reglas de validación para la solicitud de inicio de sesión:
     * - El campo "email" es obligatorio, debe ser una cadena de texto y tener formato de correo electrónico válido.
     * - El campo "password" es obligatorio y debe ser una cadena de texto.
     *
     * Estas reglas se ejecutan automáticamente antes del proceso de autenticación.
     * Si los datos no cumplen con estas condiciones, la validación fallará
     * y no se intentará autenticar al usuario.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Autenticar las credenciales de la petición.
     *
     * Este método maneja el proceso principal del inicio de sesión:
     * 1. Primero, verifica que el usuario no haya superado el número máximo
     *    de intentos permitidos de inicio de sesión (esto previene ataques de fuerza bruta).
     *    Si se excedió el límite, se lanza una excepción de bloqueo.
     * 
     * 2. Luego intenta autenticar al usuario usando los datos "email" y "password"
     *    a través de Auth::attempt().
     *    - Si es exitoso: el usuario queda autenticado en la sesión y se limpia el contador
     *      de intentos fallidos.
     *    - Si falla: se incrementa el contador de intentos fallidos en el RateLimiter
     *      y se lanza una excepción de validación con un mensaje de error.
     * 
     * De esta forma, se garantiza que solo los usuarios con credenciales correctas
     * puedan acceder al sistema.
     *
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => 'Estas credenciales no coinciden con nuestros registros.',
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Verificar que la solicitud de inicio de sesión no esté limitada por intentos.
     *
     * Este método protege contra ataques de fuerza bruta:
     * - Comprueba si se superó el número máximo de intentos permitidos (en este caso 5).
     * - Si no se superó el límite, la función simplemente termina y permite continuar.
     * - Si se superó el límite:
     *   - Dispara el evento Lockout, que puede usarse para registrar logs o disparar alertas.
     *   - Obtiene el tiempo restante (en segundos) que el usuario debe esperar antes
     *     de volver a intentar iniciar sesión.
     *   - Lanza una excepción de validación con un mensaje de error indicando
     *     cuánto tiempo debe esperar.
     *
     * Con esto, Laravel bloquea temporalmente el login cuando hay demasiados intentos fallidos.
     *
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')) . '|' . $this->ip());
    }
}
