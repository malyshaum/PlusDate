<?php

namespace App\Http\Controllers\Auth;

use App\Clients\CentrifugoClient;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AuthController extends Controller
{
    public function __construct(
        private readonly CentrifugoClient $centrifugoClient,
    )
    {

    }

    public function centrifugoToken(Request $request): Response|JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return $this->response([
            'token' => $this->centrifugoClient->generateToken($user->id)
        ]);
    }
}
