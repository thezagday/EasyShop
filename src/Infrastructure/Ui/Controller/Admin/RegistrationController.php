<?php

namespace App\Infrastructure\Ui\Controller\Admin;

use App\Application\User\Command\RegisterUser\RegisterUserCommand;
use App\Domain\Entity\User;
use App\Infrastructure\Form\RegistrationFormType;
use App\Infrastructure\Trait\CommandQueryTrait;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class RegistrationController extends AbstractController
{
    use CommandQueryTrait;

    #[Route('/register', name: 'app_register')]
    public function register(Request $request): Response
    {
        $user = new User();
        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            /** @var string $plainPassword */
            $plainPassword = $form->get('plainPassword')->getData();

            $command = new RegisterUserCommand(
                email: $user->getEmail(),
                plainPassword: $plainPassword,
                agreeTerms: true
            );

            $this->command($command);

            return $this->redirectToRoute('app_login');
        }

        return $this->render('registration/register.html.twig', [
            'registrationForm' => $form,
        ]);
    }
}
