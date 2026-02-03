<?php

namespace App\Application\User\Command\RegisterUser;

use App\Application\Contract\CommandHandlerInterface;
use App\Domain\Entity\User;
use App\Domain\Repository\UserRepositoryInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class RegisterUserHandler implements CommandHandlerInterface
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher,
        private UserRepositoryInterface $userRepository
    ) {
    }

    public function __invoke(RegisterUserCommand $command): User
    {
        $user = new User();
        $user->setEmail($command->getEmail());
        $user->setRoles(['ROLE_ADMIN']);
        
        $hashedPassword = $this->passwordHasher->hashPassword(
            $user,
            $command->getPlainPassword()
        );
        $user->setPassword($hashedPassword);

        $this->userRepository->save($user, true);

        return $user;
    }
}
