<?php

namespace App\Application\User\Command\RegisterUser;

use App\Application\Contract\CommandInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class RegisterUserCommand implements CommandInterface
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Email]
        private readonly string $email,

        #[Assert\NotBlank]
        #[Assert\Length(min: 6)]
        private readonly string $plainPassword,

        #[Assert\IsTrue(message: 'You should agree to our terms.')]
        private readonly bool $agreeTerms = false,
    ) {
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getPlainPassword(): string
    {
        return $this->plainPassword;
    }

    public function isAgreeTerms(): bool
    {
        return $this->agreeTerms;
    }
}
