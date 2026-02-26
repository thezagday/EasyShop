<?php

namespace App\Infrastructure\Ui\Command;

use App\Domain\Entity\User;
use App\Domain\Repository\UserRepositoryInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Question\Question;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

#[AsCommand(
    name: 'app:user:create-admin',
    description: 'Create a new admin user',
)]
class CreateAdminUserCommand extends Command
{
    public function __construct(
        private readonly UserRepositoryInterface $userRepository,
        private readonly UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addArgument('email', InputArgument::OPTIONAL, 'Admin email')
            ->addArgument('password', InputArgument::OPTIONAL, 'Admin password');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);

        $email = $input->getArgument('email');
        if (!$email) {
            $question = new Question('Enter admin email: ');
            $question->setValidator(function ($answer) {
                if (!filter_var($answer, FILTER_VALIDATE_EMAIL)) {
                    throw new \RuntimeException('Invalid email format');
                }
                return $answer;
            });
            $email = $io->askQuestion($question);
        }

        $existingUser = $this->userRepository->findByEmail($email);
        if ($existingUser) {
            $io->error(sprintf('User with email "%s" already exists', $email));
            return Command::FAILURE;
        }

        $password = $input->getArgument('password');
        if (!$password) {
            $question = new Question('Enter admin password: ');
            $question->setHidden(true);
            $question->setValidator(function ($answer) {
                if (strlen($answer) < 6) {
                    throw new \RuntimeException('Password must be at least 6 characters');
                }
                return $answer;
            });
            $password = $io->askQuestion($question);

            $confirmQuestion = new Question('Confirm password: ');
            $confirmQuestion->setHidden(true);
            $confirmPassword = $io->askQuestion($confirmQuestion);

            if ($password !== $confirmPassword) {
                $io->error('Passwords do not match');
                return Command::FAILURE;
            }
        }

        $user = new User();
        $user->setEmail($email);
        $user->setRoles(['ROLE_ADMIN']);
        $hashedPassword = $this->passwordHasher->hashPassword($user, $password);
        $user->setPassword($hashedPassword);

        $this->userRepository->save($user, true);

        $io->success(sprintf('Admin user "%s" created successfully', $email));

        return Command::SUCCESS;
    }
}
